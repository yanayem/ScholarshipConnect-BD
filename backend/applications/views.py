from rest_framework import generics, permissions, parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
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
        
        # 1. Check for duplicates safely
        if ScholarshipApplication.objects.filter(user=user, scholarship_id=scholarship_id).exists():
            raise ValidationError({"error": "You have already applied or requested processing for this scholarship."})

        # 2. Save the application
        instance = serializer.save(user=user)
        
        # 3. Handle notifications safely
        try:
            send_notification(
                user=user,
                title="Application Submitted",
                message=f"You have successfully applied for '{instance.scholarship.title}'. Our team will review it soon."
            )
        except:
            pass

        # 4. Automated Agency Chat Initialization safely
        admin_id = None
        if instance.application_type == 'Agency':
            try:
                from django.contrib.auth.models import User
                from community.models import ChatMessage
                agency_admin = User.objects.filter(is_superuser=True).first()
                if agency_admin:
                    admin_id = agency_admin.id
                    if agency_admin != user:
                        welcome_msg = f"Hello {instance.full_name}! We have received your agency processing request for '{instance.scholarship.title}'. A consultant will review your profile shortly."
                        ChatMessage.objects.get_or_create(
                            sender=agency_admin,
                            receiver=user,
                            message=welcome_msg,
                            defaults={'is_read': False}
                        )
            except:
                pass

        # 5. Build response data
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        if admin_id:
            response_data['agency_admin_id'] = admin_id
            
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

# ==========================
# Manage document vault including file uploads and expiration reminders.
# ==========================
class UserDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = UserDocument.objects.all()
            user_id_param = self.request.query_params.get('user_id')
            if user_id_param:
                queryset = queryset.filter(user_id=user_id_param)
            return queryset.order_by('-created_at')
            
        docs = UserDocument.objects.filter(user=user)
        
        try:
            from notifications.models import Notification
            from django.utils import timezone
            import datetime
            
            today = timezone.now().date()
            soon = today + datetime.timedelta(days=30)
            expiring = docs.filter(expiry_date__lte=soon, reminder_sent=False)
            
            for doc in expiring:
                Notification.objects.get_or_create(
                    user=self.request.user,
                    title="Document Expiring Soon",
                    message=f"Your document '{doc.name}' is set to expire on {doc.expiry_date}.",
                    defaults={'is_read': False}
                )
                doc.reminder_sent = True
                doc.save()
        except:
            pass
            
        return docs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ==========================
# Delete a specific document from the user's vault.
# ==========================
class DocumentDeleteView(generics.DestroyAPIView):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserDocument.objects.filter(user=self.request.user)

# ==========================
# Admin-only view to update the processing status of applications.
# ==========================
class ScholarshipApplicationUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            application = ScholarshipApplication.objects.get(pk=pk)
            new_status = request.data.get('status')
            if new_status:
                application.status = new_status
                application.save()
                
                send_notification(
                    user=application.user,
                    title="Application Status Updated",
                    message=f"The status of your application for '{application.scholarship_title}' has been changed to: {new_status}."
                )

                return Response({"message": f"Status updated to {new_status}"})
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        except ScholarshipApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
