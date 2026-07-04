from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'academic_level', 'cgpa', 'university')
    search_fields = ('user__username', 'full_name', 'university')
    list_filter = ('academic_level',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Personal Info', {
            'fields': ('user', 'full_name', 'phone_number', 'date_of_birth', 'bio', 'profile_picture', 'profile_picture_url')
        }),
        ('Academic Info', {
            'fields': ('academic_level', 'cgpa', 'department', 'university')
        }),
        ('Preferences & Social', {
            'fields': ('target_countries', 'preferred_fields', 'linkedin_url', 'github_url', 'facebook_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
