from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'image_url', 'author', 'author_username', 'created_at', 'updated_at']
        read_only_fields = ['author']
