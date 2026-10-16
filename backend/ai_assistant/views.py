from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .services import AIService
from .models import AIChatMessage
from .serializers import AIChatMessageSerializer
from accounts.models import Profile
from scholarships.models import Scholarship
from django.utils import timezone

def check_ai_limit(profile):
    """
    Checks if a user has exceeded their daily AI usage limit.
    Pro users: Unlimited
    Free users: 5 operations per day
    """
    if profile.is_currently_pro:
        return True, 0

    today = timezone.now().date()
    
    # Reset count if it's a new day
    if profile.last_ai_reset != today:
        profile.ai_usage_count = 0
        profile.last_ai_reset = today
        profile.save()

    limit = 5
    if profile.ai_usage_count >= limit:
        return False, limit
    
    # Increment usage
    profile.ai_usage_count += 1
    profile.save()
    return True, limit

class AIWriteSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response(
                {"error": f"Daily AI limit reached ({limit}/day). Upgrade to Pro for unlimited access."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        scholarship_id = request.data.get('scholarship_id')
        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'title': scholarship.title,
                'field': scholarship.field,
                'country': scholarship.country
            }
            result = AIService.write_sop(profile, scholarship_data)
            return Response({'sop': result, 'usage': profile.ai_usage_count, 'limit': limit})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIReviewSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
        
        sop_text = request.data.get('sop_text')
        if not sop_text:
            return Response({'error': 'SOP text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_sop(sop_text)
        return Response({'feedback': result, 'usage': profile.ai_usage_count})

class AIReviewCVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)

        cv_text = request.data.get('cv_text')
        if not cv_text:
            return Response({'error': 'CV text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_cv(cv_text)
        return Response({'feedback': result, 'usage': profile.ai_usage_count})

class AICheckEligibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        scholarship_id = request.data.get('scholarship_id')
        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'eligibility': scholarship.eligibility
            }
            result = AIService.check_eligibility(profile, scholarship_data)
            return Response({'analysis': result, 'usage': profile.ai_usage_count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIImprovePostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', 'Community Discussion')
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = AIService.improve_post(content, title)
            return Response({'improved_content': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIChatHistoryView(generics.ListAPIView):
    serializer_class = AIChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIChatMessage.objects.filter(user=self.request.user).order_by('created_at')

class AILiveSupportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save user message
        AIChatMessage.objects.create(user=request.user, message=message, is_user=True)
        
        try:
            result = AIService.live_support(message, history)
            
            # Save AI response
            AIChatMessage.objects.create(user=request.user, message=result, is_user=False)

            return Response({'response': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIGenerateBioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            result = AIService.generate_bio(profile)
            return Response({'bio': result, 'usage': profile.ai_usage_count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

from scholarships.serializers import ScholarshipSerializer

def calculate_hybrid_scholarship_matches(profile, request, limit=20):
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        SKLEARN_OK = True
    except ImportError:
        SKLEARN_OK = False

    scholarships = list(Scholarship.objects.filter(status='active'))
    if not scholarships:
        return []

    target_countries = [c.strip().lower() for c in (profile.target_countries or "").split(',') if c.strip() and c.strip().lower() != 'none']
    pref_fields = [f.strip().lower() for f in f"{profile.major_course or ''}, {profile.department or ''}, {profile.research_interests or ''}".split(',') if f.strip() and f.strip().lower() != 'none']
    skills = [s.strip().lower() for s in (profile.skills or "").split(',') if s.strip()]

    user_cgpa = None
    if profile.cgpa is not None:
        try:
            user_cgpa = float(profile.cgpa)
        except (ValueError, TypeError):
            user_cgpa = None

    user_level = (profile.academic_level or getattr(profile, 'current_level', '') or "").strip().lower()

    profile_tokens = [
        profile.full_name or '',
        profile.major_course or '',
        profile.department or '',
        profile.research_interests or '',
        profile.skills or '',
        profile.bio or '',
        profile.target_countries or '',
        profile.achievements or '',
        profile.university or ''
    ]
    profile_text = " ".join([t for t in profile_tokens if t and t.lower() != 'none']).lower()

    scholarship_texts = []
    for s in scholarships:
        st = f"{s.title} {s.provider or ''} {s.country or ''} {s.field or ''} {s.category or ''} {s.level or ''} {s.description or ''} {s.eligibility or ''}".lower()
        scholarship_texts.append(st)

    cosine_sims = None
    if SKLEARN_OK and profile_text.strip() and scholarship_texts:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([profile_text] + scholarship_texts)
            cosine_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        except Exception:
            cosine_sims = None

    country_aliases = {
        'usa': ['usa', 'us', 'united states', 'america'],
        'uk': ['uk', 'united kingdom', 'britain', 'england'],
        'canada': ['canada', 'cad'],
        'germany': ['germany', 'ger', 'deutschland'],
        'australia': ['australia', 'aus'],
        'japan': ['japan'],
        'china': ['china'],
        'europe': ['europe', 'eu'],
    }

    level_aliases = {
        'bachelors': ['bachelors', 'undergraduate', 'undergrad', 'bsc', 'ba', 'b.sc', 'hsc'],
        'masters': ['masters', 'postgraduate', 'postgrad', 'msc', 'ma', 'm.sc'],
        'phd': ['phd', 'doctorate', 'doctoral'],
    }

    results = []
    for idx, s in enumerate(scholarships):
        score = 0
        s_country = (s.country or "").lower()
        s_field = (s.field or "").lower()
        s_level = (s.level or "").lower()
        s_title = (s.title or "").lower()
        s_desc = (s.description or "").lower()
        s_elig = (s.eligibility or "").lower()

        s_min_cgpa = None
        if s.min_cgpa is not None:
            try:
                s_min_cgpa = float(s.min_cgpa)
            except (ValueError, TypeError):
                s_min_cgpa = None

        # 1. CGPA Scoring (Up to 25 pts)
        if s_min_cgpa is not None:
            if user_cgpa is not None:
                if user_cgpa >= s_min_cgpa:
                    score += 25
                elif user_cgpa >= (s_min_cgpa - 0.3):
                    score += 15
                else:
                    score += 5
            else:
                score += 12
        else:
            if user_cgpa is not None:
                score += 20
            else:
                score += 15

        # 2. Country Scoring (Up to 25 pts)
        if any(c in s_country for c in ['worldwide', 'global', 'international', 'any', 'all', 'open']):
            score += 25
        elif target_countries:
            c_match = False
            for tc in target_countries:
                if tc in s_country or s_country in tc:
                    c_match = True
                    break
                for canonical, aliases in country_aliases.items():
                    if any(a in tc for a in aliases) and any(a in s_country for a in aliases):
                        c_match = True
                        break
                if c_match:
                    break
            score += 25 if c_match else 8
        else:
            score += 15

        # 3. Field / Major & Skills Scoring (Up to 25 pts)
        if any(f in s_field for f in ['general', 'any', 'all', 'open', 'multidisciplinary', 'stem']):
            score += 22
        elif pref_fields or skills:
            f_match = False
            for pf in pref_fields:
                if pf in s_field or s_field in pf or pf in s_title or pf in s_desc or pf in s_elig:
                    f_match = True
                    break
            if not f_match and skills:
                for sk in skills:
                    if sk in s_field or sk in s_title or sk in s_desc or sk in s_elig:
                        f_match = True
                        break
            score += 25 if f_match else 10
        else:
            score += 15

        # 4. Academic Level Scoring (Up to 15 pts)
        if any(l in s_level for l in ['all', 'any', 'open']):
            score += 15
        elif user_level:
            level_matched = False
            if user_level in s_level or s_level in user_level:
                level_matched = True
            else:
                for canonical, aliases in level_aliases.items():
                    if any(a in user_level for a in aliases) and any(a in s_level for a in aliases):
                        level_matched = True
                        break
            score += 15 if level_matched else 6
        else:
            score += 10

        # 5. NLP Cosine Similarity Bonus (Up to 15 pts)
        if cosine_sims is not None and idx < len(cosine_sims):
            nlp_score = int(cosine_sims[idx] * 15)
            score += nlp_score

        final_score = min(max(score, 15), 100)

        s_data = ScholarshipSerializer(s, context={'request': request}).data

        results.append({
            'scholarship': s_data,
            'match_score': final_score
        })

    results.sort(key=lambda x: x['match_score'], reverse=True)
    return results[:limit]

class AIMatchmakerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile, _ = Profile.objects.get_or_create(user=request.user)
            is_pro = profile.is_currently_pro
            
            limit = 20 if is_pro else 12
            recommendations = calculate_hybrid_scholarship_matches(profile, request, limit=limit)

            return Response({
                'recommendations': recommendations,
                'profile_summary': f"Matches for {profile.full_name or profile.user.username}.",
                'is_pro_results': is_pro,
                'total_found': len(recommendations)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
