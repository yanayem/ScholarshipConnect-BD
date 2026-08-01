from .models import Notification

def send_notification(user, title, message):
    """
    Creates a notification for a user.
    """
    if user:
        Notification.objects.create(
            user=user,
            title=title,
            message=message
        )
        return True
    return False
