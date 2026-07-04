from rest_framework import generics, permissions, status, parsers
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Profile
from .serializers import ProfileSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    parser_classes = (parsers.MultiPartParser, parsers.JSONParser, parsers.FormParser)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        # If user is authenticated, always return their own profile
        if self.request.user.is_authenticated:
            return self.request.user.profile
        
        # Fallback for development/offline mode (only for GET)
        if self.request.method == 'GET':
            user = User.objects.first()
            if user:
                return user.profile
        return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            mock_data = {
                "id": 0, "username": "admin", "email": "admin@scholarshipconnect.bd",
                "full_name": "Administrator (Offline)", "phone_number": "017XXXXXXXX",
                "date_of_birth": "1995-01-01", "cgpa": "4.00", "academic_level": "Masters",
                "department": "IT", "university": "ScholarshipConnect BD",
                "target_countries": "Global", "preferred_fields": "Technology, Education",
                "bio": "Database is currently empty.",
                "linkedin_url": "", "github_url": "", "facebook_url": "",
                "profile_picture": None, "profile_picture_url": ""
            }
            return Response(mock_data)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance is None:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
