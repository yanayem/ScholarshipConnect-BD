from rest_framework import generics, permissions, parsers, exceptions
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import models
from .serializers import ProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow login using either username or email
        login_id = attrs.get('username')
        password = attrs.get('password')

        if login_id and password:
            user = User.objects.filter(models.Q(username=login_id) | models.Q(email=login_id)).first()
            if user and user.check_password(password):
                attrs['username'] = user.username # SimpleJWT needs the actual username
            elif not user:
                 raise exceptions.AuthenticationFailed("No account found with this email/username.")
        
        data = super().validate(attrs)
        if not self.user.is_staff:
            raise exceptions.PermissionDenied("Only staff members can log in here.")
        return data

class AdminLoginView(TokenObtainPairView):
    """
    Admin authentication using Email/Username and Password.
    """
    serializer_class = AdminTokenObtainPairSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Profile management for the authenticated user.
    Supports JSON and MultiPart (for profile picture uploads).
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.JSONParser, parsers.FormParser)

    def get_object(self):
        # Always return the profile of the user making the request
        return self.request.user.profile

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True) # Default to partial updates for profile
        instance = self.get_object()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
