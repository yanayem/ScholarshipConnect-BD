from django.contrib import admin
from .models import Scholarship

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'country', 'category', 'deadline', 'is_featured', 'is_active')
    search_fields = ('title', 'provider', 'country', 'category')
    list_filter = ('is_featured', 'country', 'category', 'deadline', 'level')
    list_editable = ('deadline', 'is_featured')
    readonly_fields = ('created_at', 'updated_at')

    def is_active(self, obj):
        from django.utils import timezone
        return obj.deadline >= timezone.now().date()
    is_active.boolean = True
    is_active.short_description = 'Active?'
