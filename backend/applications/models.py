from django.db import models
from django.contrib.auth.models import User
from scholarships.models import Scholarship

class SavedScholarship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_scholarships')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'scholarship')

class ScholarshipApplication(models.Model):
    STATUS_CHOICES = [
        ('Saved', 'Saved'),
        ('Applied', 'Applied'),
        ('Processing', 'Processing'), # New status for Agency
        ('Under Review', 'Under Review'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    APPLICATION_TYPES = [
        ('Self', 'Self Application'),
        ('Agency', 'Agency Processing'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    application_type = models.CharField(max_length=10, choices=APPLICATION_TYPES, default='Self')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    university = models.CharField(max_length=255, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    ielts_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    academic_level = models.CharField(max_length=50, blank=True)
    sop = models.TextField(verbose_name="Statement of Purpose")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'scholarship')

    def _str_(self):
        return f"{self.full_name} - {self.scholarship.title}"
