import logging
from firebase_admin import messaging
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

def send_push_notification(user, title, body, data=None):
    """
    Sends a push notification to a specific user via FCM.
    """
    try:
        profile = user.profile
        token = profile.fcm_token
        
        if not token:
            logger.debug(f"No FCM token found for user {user.username}")
            return False

        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        
        response = messaging.send(message)
        logger.info(f"Successfully sent push notification to {user.username}: {response}")
        return True
    except Exception as e:
        logger.error(f"Error sending push notification to {user.username}: {e}")
        return False

def send_bulk_push_notification(users_queryset, title, body, data=None):
    """
    Sends a push notification to multiple users.
    """
    tokens = []
    for user in users_queryset:
        if hasattr(user, 'profile') and user.profile.fcm_token:
            tokens.append(user.profile.fcm_token)
    
    if not tokens:
        logger.debug("No FCM tokens found in the provided users")
        return 0

    # FCM allows up to 500 tokens per multicast message
    success_count = 0
    for i in range(0, len(tokens), 500):
        batch_tokens = tokens[i:i + 500]
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            tokens=batch_tokens,
        )
        try:
            response = messaging.send_each_for_multicast(message)
            success_count += response.success_count
            logger.info(f"Multicast batch sent: {response.success_count} success, {response.failure_count} failure")
        except Exception as e:
            logger.error(f"Error sending multicast notification batch: {e}")
            
    return success_count
