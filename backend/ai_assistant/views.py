from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import AIService
from accounts.models import Profile
from scholarships.models import Scholarship

class AIWriteSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        scholarship_id = request.data.get('scholarship_id')
        try:
            profile = request.user.profile
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'title': scholarship.title,
                'field': scholarship.field,
                'country': scholarship.country
            }
            result = AIService.write_sop(profile, scholarship_data)
            return Response({'sop': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIReviewSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        sop_text = request.data.get('sop_text')
        if not sop_text:
            return Response({'error': 'SOP text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_sop(sop_text)
        return Response({'feedback': result})

class AIReviewCVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cv_text = request.data.get('cv_text')
        if not cv_text:
            return Response({'error': 'CV text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_cv(cv_text)
        return Response({'feedback': result})

class AICheckEligibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        scholarship_id = request.data.get('scholarship_id')
        try:
            profile = request.user.profile
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'eligibility': scholarship.eligibility
            }
            result = AIService.check_eligibility(profile, scholarship_data)
            return Response({'analysis': result})
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
