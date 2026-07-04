from django.urls import path
from .views import (
    ScholarshipListCreateView, 
    ScholarshipRetrieveUpdateDestroyView, 
    BulkScholarshipUploadView,
    EligibilityCheckView,
    ScholarshipApproveView
)

urlpatterns = [
    path('', ScholarshipListCreateView.as_view(), name='scholarship-list-create'),
    path('bulk-upload/', BulkScholarshipUploadView.as_view(), name='scholarship-bulk-upload'),
    path('check-eligibility/', EligibilityCheckView.as_view(), name='scholarship-eligibility-check'),
    path('<int:pk>/', ScholarshipRetrieveUpdateDestroyView.as_view(), name='scholarship-detail'),
    path('<int:pk>/approve/', ScholarshipApproveView.as_view(), name='scholarship-approve'),
]
