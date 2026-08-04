from .models import Notification
from django.core.mail import send_mail
from django.conf import settings

def send_notification(user, title, message, send_email=False):
    """
    Helper function to create a notification for a specific user and optionally send an email.
    """
    try:
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message
        )
        
        if send_email and user.email:
            send_mail(
                subject=title,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            
        return notification
    except Exception as e:
        print(f"Error sending notification/email to {user.username}: {e}")
        return None
