from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    ACADEMIC_LEVEL_CHOICES = [
        ('HSC', 'Higher Secondary'),
        ('Bachelors', 'Bachelors'),
        ('Masters', 'Masters'),
        ('PhD', 'PhD'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Academic Info
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    academic_level = models.CharField(max_length=20, choices=ACADEMIC_LEVEL_CHOICES, blank=True)
    department = models.CharField(max_length=100, blank=True)
    university = models.CharField(max_length=255, blank=True)
    
    # Preferences
    target_countries = models.CharField(max_length=255, blank=True, help_text="Comma separated countries")
    preferred_fields = models.CharField(max_length=255, blank=True, help_text="Comma separated fields (e.g., Engineering, Arts)")
    bio = models.TextField(max_length=500, blank=True)
    
    # Social Media Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    profile_picture_url = models.URLField(blank=True) # Fallback/Alternative
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Signals to create/save profile when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
