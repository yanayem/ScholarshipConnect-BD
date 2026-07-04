from rest_framework import serializers
from .models import BlogPost
from django.contrib.auth.models import User

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_full_name = serializers.CharField(source='author.profile.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'author', 'author_name', 'author_full_name', 
            'university', 'content', 'tags', 'image_url', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author']
