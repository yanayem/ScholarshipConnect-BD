from django.urls import path
from .views import (
    SavedScholarshipListCreateView,
    SavedScholarshipDestroyView,
    ScholarshipApplicationListCreateView,
    UserDocumentListCreateView,
    DocumentDeleteView
)

urlpatterns = [
    path('saved/', SavedScholarshipListCreateView.as_view(), name='saved-scholarships'),
    path('saved/<int:pk>/', SavedScholarshipDestroyView.as_view(), name='saved-scholarship-delete'),
    path('apply/', ScholarshipApplicationListCreateView.as_view(), name='scholarship-apply'),
    path('documents/', UserDocumentListCreateView.as_view(), name='user-documents'),
    path('documents/<int:pk>/', DocumentDeleteView.as_view(), name='document-delete'),
]
