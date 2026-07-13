from django.db import models
from django.contrib.auth.models import User

class Discussion(models.Model):
    CATEGORY_CHOICES = [
        ('General', 'General Discussion'),
        ('Scholarship Help', 'Scholarship Help'),
        ('Visa Advice', 'Visa Advice'),
        ('Success Story', 'Success Story'),
        ('IELTS/GRE', 'IELTS/GRE Preparation'),
    ]

    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    is_solved = models.BooleanField(default=False)
    image = models.ImageField(upload_to='discussion_images/', blank=True, null=True)
    poll_question = models.CharField(max_length=255, blank=True, null=True)
    
    likes = models.ManyToManyField(User, related_name='liked_discussions', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class PollOption(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='poll_options')
    text = models.CharField(max_length=255)
    
    def __str__(self):
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

    def __str__(self):
        return f"Comment by {self.user.username} on {self.discussion.title}"

class Story(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stories')
    media = models.FileField(upload_to='stories/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Story by {self.user.username} at {self.created_at}"

class StoryReaction(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('fire', 'Fire'),
        ('clap', 'Clap'),
    ]
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('story', 'user')

class MentorshipSession(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_sessions')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentee_sessions')
    topic = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic} ({self.mentor.username} & {self.mentee.username})"
