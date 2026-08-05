from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Scholarship
from .serializers import ScholarshipSerializer
from accounts.models import Profile
from notifications.utils import send_notification
from django.core.cache import cache

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the submitter or staff
        # Submitter is checked by ID if submitted_by is null (guest case - not possible to match though)
        return (request.user and request.user.is_authenticated) and (
            request.user.is_staff or obj.submitted_by == request.user
        )

@method_decorator(csrf_exempt, name='dispatch')
class ScholarshipViewSet(viewsets.ModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAdminOrOwner]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'provider', 'country', 'category', 'level', 'field']
    ordering_fields = ['created_at', 'deadline', 'min_cgpa']
    ordering = ['-created_at']

    def list(self, request, *args, **kwargs):
        # Optimization: Prefetch saved status for authenticated users to avoid N+1 in serializer
        response = super().list(request, *args, **kwargs)
        return response

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            # Fetch all saved scholarship IDs for this user at once
            from applications.models import SavedScholarship
            saved_scholarships = SavedScholarship.objects.filter(user=user).values_list('scholarship_id', 'id')
            context['saved_dict'] = {s_id: save_id for s_id, save_id in saved_scholarships}
        return context

    def get_queryset(self):
        user = self.request.user
        status_param = self.request.query_params.get('status')
        
        # Base queryset with optimization
        queryset = Scholarship.objects.select_related('submitted_by').all()
        
        # Filtering logic for lists:
        # Staff see everything (except rejected by default).
        # Users see active + their own.
        # We only apply these filters for the 'list' action to allow retrieve/update/delete on all items.
        if self.action == 'list':
            if user and user.is_authenticated:
                if user.is_staff:
                    if status_param:
                        queryset = queryset.filter(status=status_param)
                    else:
                        queryset = queryset.exclude(status='rejected')
                else:
                    queryset = queryset.filter(Q(status='active') | Q(submitted_by=user)).exclude(status='rejected')
            else:
                queryset = queryset.filter(status='active')
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        # Staff posts are active by default, others (users/guests) are pending
        is_staff = user.is_authenticated and user.is_staff
        status_val = 'active' if is_staff else 'pending'
        
        serializer.save(
            submitted_by=user if user.is_authenticated else None, 
            status=status_val
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        print(f"[DEBUG] Deleting Scholarship: {instance.title} (ID: {instance.id})")
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        scholarship = self.get_object()
        action_type = str(request.data.get('action', '')).lower()
        note = request.data.get('note', '').strip()
        previous_status = scholarship.status
        
        if action_type == 'approve':
            action_verb = 'approved'
            action_title = 'Approved'
            scholarship.status = 'active'
        elif action_type == 'reject':
            action_verb = 'rejected'
            action_title = 'Rejected'
            scholarship.status = 'rejected'
            scholarship.admin_note = note
        else:
            return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
        
        scholarship.save()

        # Points System Logic
        if previous_status == 'pending' and scholarship.submitted_by:
            profile = scholarship.submitted_by.get_profile()
            points_change = 0
            msg = ""
            
            if scholarship.status == 'active':
                points_change = 200
                msg = f"Scholarship approved. 200 points awarded to {scholarship.submitted_by.username}."
            elif scholarship.status == 'rejected':
                points_change = -50
                msg = f"Scholarship rejected. 50 points deducted from {scholarship.submitted_by.username}."
            
            if points_change != 0:
                profile.scholar_points += points_change
                profile.save()
            
            # Send notification to the user who submitted the scholarship
            display_points = points_change if points_change > 0 else -points_change
            notification_message = f"Your submission '{scholarship.title}' has been {action_verb}. {display_points} ScholarPoints {'awarded' if points_change > 0 else 'deducted'}."
            
            if note:
                notification_message += f" Note from admin: {note}"
            
            send_notification(
                user=scholarship.submitted_by,
                title=f"Scholarship {action_title}",
                message=notification_message,
                scholarship_id=scholarship.id
            )
        
        return Response({
            "message": f"Scholarship {action_type}d successfully", 
            "status": scholarship.status,
            "points_updated": True if previous_status == 'pending' and scholarship.submitted_by else False
        })

    @action(detail=False, methods=['post'], url_path='bulk-upload', permission_classes=[permissions.IsAdminUser])
    def bulk_upload(self, request):
        if not isinstance(request.data, list):
            return Response({"error": "Expected a list of scholarships"}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in request.data:
            if 'status' not in item:
                item['status'] = 'active'
            if 'submitted_by' not in item and request.user.is_authenticated:
                item['submitted_by'] = request.user.id

        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='check-eligibility', permission_classes=[permissions.IsAuthenticated])
    def check_eligibility(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        queryset = Scholarship.objects.filter(
            deadline__gte=timezone.now().date(), 
            status='active'
        )

        if profile.cgpa is not None:
            queryset = queryset.filter(Q(min_cgpa__lte=profile.cgpa) | Q(min_cgpa__isnull=True))

        if profile.academic_level:
            queryset = queryset.filter(level__icontains=profile.academic_level)

        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            "user_info": {
                "cgpa": profile.cgpa,
                "academic_level": profile.academic_level
            },
            "matches": serializer.data,
            "count": queryset.count()
        })

    @action(detail=False, methods=['get'], url_path='matchmaker', permission_classes=[permissions.IsAuthenticated])
    def matchmaker(self, request):
        """
        AI-Powered Matchmaker: Suggests scholarships based on student profile.
        """
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        
        scholarships = Scholarship.objects.filter(status='active', deadline__gte=timezone.now().date())
        results = []
        
        # Build Profile Text for NLP
        profile_text = f"{profile.target_countries} {profile.major_course} {profile.research_interests} {profile.bio} {profile.skills} {profile.academic_level}".lower()
        
        scholarship_texts = []
        valid_scholarships = []
        
        # Pre-filter for CGPA
        for s in scholarships:
            base_score = 0
            if s.min_cgpa:
                if profile.cgpa and profile.cgpa >= s.min_cgpa:
                    base_score += 40
                else:
                    continue # Skip if CGPA doesn't meet minimum
            else:
                base_score += 20
                
            # Add some base points for exact matches too to retain structured data weight
            if profile.target_countries and s.country:
                targets = [c.strip().lower() for c in str(profile.target_countries).split(',') if c.strip()]
                if s.country.lower() in targets:
                    base_score += 20
            
            if (profile.major_course or profile.research_interests) and s.field:
                preferred = [f.strip().lower() for f in f"{profile.major_course}, {profile.research_interests}".split(',') if f.strip()]
                if s.field.lower() in preferred:
                    base_score += 20
            
            if profile.academic_level and s.level:
                if profile.academic_level.lower() in s.level.lower():
                    base_score += 10
                    
            valid_scholarships.append((s, base_score))
            
            # Build Scholarship Text for NLP
            s_text = f"{s.title} {s.country} {s.field} {s.level} {s.description} {s.eligibility}".lower()
            scholarship_texts.append(s_text)
            
        # NLP TF-IDF Cosine Similarity
        if SKLEARN_AVAILABLE and valid_scholarships and profile_text.strip():
            vectorizer = TfidfVectorizer(stop_words='english')
            # Fit on profile + scholarships
            tfidf_matrix = vectorizer.fit_transform([profile_text] + scholarship_texts)
            
            # Similarity between profile (index 0) and scholarships (index 1 to end)
            cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
            
            for idx, (s, base_score) in enumerate(valid_scholarships):
                # Scale similarity (0 to 1) to a score out of 50
                nlp_score = int(cosine_similarities[idx] * 50)
                final_score = base_score + nlp_score
                
                results.append({
                    "scholarship": ScholarshipSerializer(s).data,
                    "match_score": final_score
                })
        else:
            # Fallback if sklearn is not available or profile is totally empty
            for s, base_score in valid_scholarships:
                results.append({
                    "scholarship": ScholarshipSerializer(s).data,
                    "match_score": base_score
                })
        
        # Sort by match score
        results = sorted(results, key=lambda x: x['match_score'], reverse=True)
        
        return Response({
            "profile_summary": {
                "cgpa": profile.cgpa,
                "countries": profile.target_countries,
                "major": profile.major_course,
                "interests": profile.research_interests
            },
            "recommendations": results[:10] # Top 10 matches
        })

    @action(detail=False, methods=['get'], url_path='autocomplete', permission_classes=[permissions.AllowAny])
    def autocomplete(self, request):
        """
        Ultra-fast autocomplete endpoint using in-memory caching.
        """
        query_type = request.query_params.get('type', '')
        q = request.query_params.get('q', '').strip().lower()
        
        if not q or not query_type:
            return Response([])

        cache_key = f"autocomplete_{query_type}"
        cached_list = cache.get(cache_key)

        if cached_list is None:
            # Need to populate cache
            if query_type == 'country':
                cached_list = list(Scholarship.objects.exclude(country__isnull=True).exclude(country='').values_list('country', flat=True).distinct())
            elif query_type == 'field':
                cached_list = list(Scholarship.objects.exclude(field__isnull=True).exclude(field='').values_list('field', flat=True).distinct())
            elif query_type == 'skills':
                # Skills are comma separated in profiles
                profiles = Profile.objects.exclude(skills__isnull=True).exclude(skills='').values_list('skills', flat=True)
                skills_set = set()
                for skills_str in profiles:
                    for skill in skills_str.split(','):
                        skill = skill.strip()
                        if skill:
                            skills_set.add(skill)
                cached_list = list(skills_set)
            else:
                return Response([])
            
            # Cache for 1 hour
            cache.set(cache_key, cached_list, 3600)

        # In-memory filtering (Lightning fast)
        # We find items that contain the query substring, case insensitive
        suggestions = [item for item in cached_list if q in item.lower()]
        
        # Return top 5 suggestions
        return Response(suggestions[:5])

    @action(detail=False, methods=['get'], url_path='submission-feedback', permission_classes=[permissions.IsAuthenticated])
    def submission_feedback(self, request):
        """
        Returns only the rejected scholarships submitted by the current user.
        """
        queryset = Scholarship.objects.filter(
            submitted_by=request.user, 
            status='rejected'
        ).order_by('-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='cleanup-rejected', permission_classes=[permissions.IsAdminUser])
    def cleanup_rejected(self, request):
        """
        Manually trigger deletion of rejected scholarships older than 30 days.
        """
        from django.core.management import call_command
        try:
            call_command('delete_old_rejected_scholarships')
            return Response({"message": "Cleanup successful"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='admin-stats', permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, request):
        """
        Admin-only endpoint to get system-wide statistics for the dashboard.
        """
        from django.contrib.auth.models import User
        from community.models import MentorshipSession
        from applications.models import ScholarshipApplication

        total_scholarships = Scholarship.objects.count()
        total_users = User.objects.count()
        total_applications = ScholarshipApplication.objects.count()
        total_mentorships = MentorshipSession.objects.count()

        # Simple country breakdown for the progress bars
        countries = list(Scholarship.objects.exclude(country__isnull=True).exclude(country='').values_list('country', flat=True))
        from collections import Counter
        counts = Counter(countries)
        popular_countries = []
        total_with_country = len(countries)
        
        for name, count in counts.most_common(5):
            popular_countries.append({
                "name": name,
                "count": count,
                "percentage": int((count / total_with_country) * 100) if total_with_country > 0 else 0
            })

        return Response({
            "total_scholarships": total_scholarships,
            "total_users": total_users,
            "total_applications": total_applications,
            "total_mentorships": total_mentorships,
            "popular_countries": popular_countries
        })
