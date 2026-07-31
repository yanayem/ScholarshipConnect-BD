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
