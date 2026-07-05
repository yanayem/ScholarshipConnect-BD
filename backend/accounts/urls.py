from django.urls import path
from .views import ProfileView, AdminLoginView

urlpatterns = [
    # Registration and Login are handled via Firebase on the frontend
    # The backend verifies the Firebase ID token in the Authorization header
    path('profile/', ProfileView.as_view(), name='user_profile'),
    path('admin-login/', AdminLoginView.as_view(), name='admin_login'),
]
