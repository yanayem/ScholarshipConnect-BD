import os
import logging
import firebase_admin
from firebase_admin import credentials
from django.apps import AppConfig

logger = logging.getLogger(__name__)

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Initialize Firebase Admin SDK
        from django.conf import settings
        firebase_creds_name = settings.FIREBASE_SERVICE_ACCOUNT_KEY
        
        try:
            firebase_admin.get_app()
        except ValueError:
            # App not initialized yet
            firebase_creds_path = os.path.join(settings.BASE_DIR, firebase_creds_name) if firebase_creds_name else None
            
            if firebase_creds_path and os.path.exists(firebase_creds_path):
                try:
                    cred = credentials.Certificate(firebase_creds_path)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin SDK initialized successfully.")
                except Exception as e:
                    logger.error(f"Error initializing Firebase Admin SDK: {e}")
            else:
                try:
                    # Attempt default initialization
                    firebase_admin.initialize_app()
                    logger.info("Firebase Admin SDK initialized with default credentials.")
                except Exception:
                    if firebase_creds_path:
                        logger.warning(f"Firebase key not found at: {firebase_creds_path}")
                    else:
                        logger.warning("Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_KEY not set.")
