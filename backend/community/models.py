from django.db import models
from django.contrib.auth.models import User

class Discussion(models.Model):
    CATEGORY_CHOICES = [
        ('General', 'General Discussion'),
        ('Scholarship Help', 'Scholarship Help'),
        ('Scholarships', 'Scholarships'),
        ('SOP/CV', 'SOP/CV Advice'),
        ('Visa Advice', 'Visa Advice'),
        ('Visa', 'Visa Advice'), # Duplicate for frontend compatibility
        ('Success Story', 'Success Story'),
        ('IELTS/GRE', 'IELTS/GRE Preparation'),
        ('Test Prep', 'Test Prep (IELTS/GRE)'),
        ('Life Abroad', 'Life Abroad'),
    ]

    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    is_solved = models.BooleanField(default=False)
    points_awarded = models.BooleanField(default=False)
    image = models.ImageField(upload_to='discussion_images/', blank=True, null=True)
    poll_question = models.CharField(max_length=255, blank=True, null=True)
    
    likes = models.ManyToManyField(User, related_name='liked_discussions', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class PollOption(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='poll_options')
    text = models.CharField(max_length=255)
    
    def _str_(self):
        return f"{self.text} ({self.discussion.title})"

    @property
    def votes_count(self):
        return self.votes.count()

class PollVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='poll_votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')

    class Meta:
        unique_together = ('user', 'discussion')

class DiscussionComment(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"Comment by {self.user.username} on {self.discussion.title}"
