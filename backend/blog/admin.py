from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'university', 'created_at')
    search_fields = ('title', 'author__username', 'university', 'content', 'tags')
    list_filter = ('created_at', 'university')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Article Content', {
            'fields': ('title', 'author', 'university', 'content', 'image_url')
        }),
        ('Metadata', {
            'fields': ('tags', 'created_at', 'updated_at')
        }),
    )
