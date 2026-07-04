from rest_framework import generics, permissions
from .models import SavedScholarship, ScholarshipApplication, UserDocument
from .serializers import (
    SavedScholarshipSerializer, 
    ScholarshipApplicationSerializer, 
    UserDocumentSerializer
)

class SavedScholarshipListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedScholarshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedScholarship.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ScholarshipApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ScholarshipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ScholarshipApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserDocument.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentDeleteView(generics.DestroyAPIView):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserDocument.objects.filter(user=self.request.user)
