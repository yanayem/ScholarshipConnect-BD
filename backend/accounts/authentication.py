"""
FIREBASE AUTH: Custom authentication backend for DRF.
- Verifies Firebase ID Tokens from the mobile app.
- Maps Firebase UID to Django User model.
- Automatically creates profiles and handles admin promotion.
- Connected to: accounts.models.Profile, settings.REST_FRAMEWORK.
"""
from firebase_admin import auth
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions
import os

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        id_token = auth_header.split(' ').pop()
        
        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception:
            # If Firebase verification fails, return None so other 
            # authentication classes (like SimpleJWT) can try.
            return None

        if not id_token or not decoded_token:
            return None

        try:
            uid = decoded_token.get('uid')
            email = decoded_token.get('email', '')
            
            # Map Firebase users to Django users by uid (used as username)
            user, created = User.objects.get_or_create(
                username=uid, 
                defaults={'email': email}
            )

            # Check for admin status from environment variable
            admin_emails = [e.strip() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()]
            if email and email in admin_emails and not user.is_staff:
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            # If the user was just created or email changed, update it
            if not created and email and user.email != email:
                user.email = email
                user.save()
            
            if created:
                name = decoded_token.get('name', '')
                if name:
                    user.profile.full_name = name
                    user.profile.save()
            
            return (user, None)
        except Exception:
            raise exceptions.AuthenticationFailed('User authentication failed')
