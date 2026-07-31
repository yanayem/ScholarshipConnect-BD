from django.db import models
from django.contrib.auth.models import User

class AIRequestLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=50) # SOP_WRITE, SOP_REVIEW, CV_REVIEW, ELIGIBILITY
    prompt = models.TextField()
    response = models.TextField()
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return f"{self.user.username} - {self.request_type} - {self.created_at}"
