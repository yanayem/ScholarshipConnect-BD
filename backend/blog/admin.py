from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'university', 'created_at')
    search_fields = ('title', 'author__username', 'content')
    list_filter = ('created_at',)
