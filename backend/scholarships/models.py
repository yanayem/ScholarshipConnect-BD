from django.db import models
from django.contrib.auth.models import User
from core.fields import SafeDecimalField
from core.utils import compress_image

class Scholarship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    provider = models.CharField(max_length=255, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    amount = models.CharField(max_length=255, blank=True, default='', help_text="e.g. Full Tuition, $10,000, etc.")
    category = models.CharField(max_length=100, blank=True, default='')
    level = models.CharField(max_length=100, blank=True, default='', help_text="e.g. Bachelors, Masters, PhD")
    field = models.CharField(max_length=100, blank=True, default='', help_text="e.g. Engineering, Arts, etc.")
    min_cgpa = SafeDecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    deadline = models.DateField()
    description = models.TextField(blank=True, default='')
    eligibility = models.TextField(blank=True, default='')
    official_link = models.URLField(blank=True, default='')
    image_url = models.URLField(blank=True, default='')
    image = models.ImageField(upload_to='scholarships/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)

    # Verification System
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.image:
            new_image = compress_image(self.image)
            if new_image:
                self.image = new_image
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
