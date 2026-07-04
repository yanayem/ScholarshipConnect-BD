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
        ('Under Review', 'Under Review'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    university = models.CharField(max_length=255, blank=True)
    sop = models.TextField(verbose_name="Statement of Purpose")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.scholarship.title}"

class UserDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=100)
    file_url = models.URLField()
    size = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"
