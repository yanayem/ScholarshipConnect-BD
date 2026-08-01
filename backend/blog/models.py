from django.db import models
from django.contrib.auth.models import User

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.URLField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
