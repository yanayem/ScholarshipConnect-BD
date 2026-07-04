from django.contrib import admin
from .models import SavedScholarship, ScholarshipApplication, UserDocument

@admin.register(SavedScholarship)
class SavedScholarshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'scholarship', 'created_at')

@admin.register(ScholarshipApplication)
class ScholarshipApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'scholarship', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'scholarship__title', 'full_name')

@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'doc_type', 'created_at')
    search_fields = ('name', 'user__username')
