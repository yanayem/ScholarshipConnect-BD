"""
FIREBASE AUTH: Custom authentication backend for DRF.
- Verifies Firebase ID Tokens from the mobile app.
- Maps Firebase UID to Django User model.
- Automatically creates profiles and handles admin promotion.
- Connected to: accounts.models.Profile, settings.REST_FRAMEWORK.
"""
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions
import os

# Initialize Firebase Admin SDK
# You need to provide the path to your service account key JSON file
# For now, we assume it's set in an environment variable or a default path
firebase_creds_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')

if not firebase_admin._apps:
    if firebase_creds_path and os.path.exists(firebase_creds_path):
        cred = credentials.Certificate(firebase_creds_path)
        firebase_admin.initialize_app(cred)
    else:
        # Default initialization (works if running on GCP or with GOOGLE_APPLICATION_CREDENTIALS)
        try:
            firebase_admin.initialize_app()
        except Exception:
            # For development, we might not want to crash if Firebase is not yet configured
            print("Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_KEY not found.")

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        id_token = auth_header.split(' ').pop()
        
        try:
            # Bypass Firebase verification for development/testing if using the mock token
            if settings.DEBUG and id_token == 'mock-admin-token':
                user, created = User.objects.get_or_create(
                    username='admin_test', 
                    defaults={'email': 'admin@scholarshipconnect.bd', 'is_staff': True, 'is_superuser': True}
                )
                return (user, None)

            decoded_token = auth.verify_id_token(id_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed('Invalid Firebase token')

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
