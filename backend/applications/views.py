from rest_framework import generics, permissions, parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SavedScholarship, ScholarshipApplication, UserDocument
from .serializers import (
    SavedScholarshipSerializer, 
    ScholarshipApplicationSerializer, 
    UserDocumentSerializer
)
from notifications.utils import send_notification

# ==========================
# List saved scholarships and bookmark new ones for the current user.
# ==========================
class SavedScholarshipListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedScholarshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedScholarship.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ==========================
# Remove a specific scholarship from the user's saved list.
# ==========================
class SavedScholarshipDestroyView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavedScholarship.objects.filter(user=self.request.user)
# ==========================
# Handle scholarship application submissions and view application history.
# ==========================
class ScholarshipApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ScholarshipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ScholarshipApplication.objects.all().order_by('-created_at')
        return ScholarshipApplication.objects.filter(user=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.perform_create(serializer)

    def perform_create(self, serializer):
        user = self.request.user
        scholarship_id = self.request.data.get('scholarship')
        
        if ScholarshipApplication.objects.filter(user=user, scholarship_id=scholarship_id).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "You have already applied or requested processing for this scholarship."})
            
        instance = serializer.save(user=user)
        
        send_notification(
            user=user,
            title="Application Submitted",
            message=f"You have successfully applied for '{instance.scholarship.title}'. Our team will review it soon."
        )

        if instance.application_type == 'Agency':
            from django.contrib.auth.models import User
            from community.models import ChatMessage
            agency_admin = User.objects.filter(is_superuser=True).first()
            if agency_admin and agency_admin != user:
                welcome_msg = f"Hello {instance.full_name}! We have received your agency processing request for '{instance.scholarship.title}'. A consultant will review your profile and get back to you shortly."
                ChatMessage.objects.create(
                    sender=agency_admin,
                    receiver=user,
                    message=welcome_msg,
                    is_read=False
                )
        
        admin_id = None
        if instance.application_type == 'Agency':
            from django.contrib.auth.models import User
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                admin_id = admin_user.id
        
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        if admin_id:
            response_data['agency_admin_id'] = admin_id
            
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
