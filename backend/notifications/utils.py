from .models import Notification
from django.core.mail import send_mail
from django.conf import settings
from .fcm_service import send_push_notification

def send_notification(user, title, message, send_email=False, scholarship_id=None):
    """
    Helper function to create a notification for a specific user, 
    send a push notification, and optionally send an email.
    """
    try:
        # 1. Create database notification
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            scholarship_id=scholarship_id
        )
        
        # 2. Send Push Notification via FCM
        try:
            data = {"type": "notification"}
            if scholarship_id:
                data["scholarship_id"] = f"{scholarship_id}"
            
            send_push_notification(user, title, message, data=data)
        except Exception as fcm_err:
            print(f"[NOTIFICATION ERROR] FCM Push failed: {fcm_err}")
        
        # 3. Optionally send Email
        if send_email and user.email:
            try:
                send_mail(
                    subject=title,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as email_err:
                print(f"[NOTIFICATION ERROR] Email failed: {email_err}")
            
        return notification
    except Exception as e:
        print(f"[NOTIFICATION ERROR] Global failure for {user.username}: {e}")
        return None
