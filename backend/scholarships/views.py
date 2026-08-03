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

    def get_queryset(self):
        user = self.request.user
        status_param = self.request.query_params.get('status')
        
        print(f"[DEBUG] Scholarship QuerySet for User: {user} (Authenticated: {user.is_authenticated})")
        
        # Base queryset
        queryset = Scholarship.objects.all()
        
        # Filtering by status logic:
        # 1. Staff can see all scholarships, or filter by a specific status.
        # 2. Regular users see all 'active' scholarships PLUS their own 'pending/rejected' submissions.
        # 3. Guests only see 'active' scholarships.
        
        if user and user.is_authenticated:
            if user.is_staff:
                if status_param:
                    queryset = queryset.filter(status=status_param)
            else:
                # Regular user: see active OR their own submitted ones
                queryset = queryset.filter(Q(status='active') | Q(submitted_by=user))
        else:
            # Guests
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        scholarship = self.get_object()
        action_type = str(request.data.get('action', '')).lower()
        previous_status = scholarship.status
        
        if action_type == 'approve':
            scholarship.status = 'active'
        elif action_type == 'reject':
            scholarship.status = 'rejected'
        else:
            return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
        
        scholarship.save()

        # Points System Logic
        # Only grant/deduct points if moving from 'pending' to 'active' or 'rejected'
        # to avoid awarding points multiple times if an admin toggles status.
        if previous_status == 'pending' and scholarship.submitted_by:
            profile = scholarship.submitted_by.get_profile()
            points_change = 0
            msg = ""
            
            if scholarship.status == 'active':
                points_change = 50 # Reward for valid submission
                msg = f"Scholarship approved. 50 points awarded to {scholarship.submitted_by.username}."
            elif scholarship.status == 'rejected':
                points_change = -20 # Deduction for invalid/spam submission
                msg = f"Scholarship rejected. 20 points deducted from {scholarship.submitted_by.username}."
            
            if points_change != 0:
                profile.scholar_points += points_change
                profile.save()
                print(f"[POINTS] {msg} New Total: {profile.scholar_points}")
            
            # Send notification to the user who submitted the scholarship
            send_notification(
                user=scholarship.submitted_by,
                title=f"Scholarship {action_type.capitalize()}ed",
                message=f"Your submission '{scholarship.title}' has been {action_type}ed by admins. {points_change} ScholarPoints {'awarded' if points_change > 0 else 'deducted'}."
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
  """
  azman
  """
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
