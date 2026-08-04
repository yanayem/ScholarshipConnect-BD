from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import AIService
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

class AILiveSupportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = AIService.live_support(message, history)
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

class AIMatchmakerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Calls the matchmaker logic from ScholarshipViewSet.
        """
        from scholarships.views import ScholarshipViewSet
        # Instantiate the viewset to access its action
        viewset = ScholarshipViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        return viewset.matchmaker(request)
