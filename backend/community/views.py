from rest_framework import generics, permissions, status, response, serializers
from rest_framework.views import APIView
from django.db.models import Q
from .models import Discussion, PollOption, PollVote
from .serializers import (
    DiscussionSerializer, DiscussionCommentSerializer, 
    StorySerializer, StoryReactionSerializer, 
)
from django.contrib.auth.models import User
from accounts.models import Profile
from notifications.models import Notification
from notifications.utils import send_notification
from itertools import chain

class DiscussionListCreateView(generics.ListCreateAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

from rest_framework.exceptions import PermissionDenied
from ai_assistant.services import AIService

class DiscussionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        obj = self.get_object()
        was_solved = obj.is_solved
        
        # Only author or staff can update the discussion
        if obj.author == self.request.user or self.request.user.is_staff:
            instance = serializer.save()
            
            # Smart Point Distribution: If marked as solved, analyze comments
            if instance.is_solved and not was_solved:
                self.distribute_points(instance)
        else:
            raise PermissionDenied("You are not the author of this post.")

    def distribute_points(self, discussion):
        if discussion.points_awarded:
            return
            
        try:
            comments = discussion.comments.all()
            if not comments.exists():
                return

            comment_data = [{'id': c.id, 'user_id': c.user.id, 'text': c.content} for c in comments]
            
            # Call AI to find the best answer
            best_comment_id = AIService.analyze_best_solution(
                discussion.title, 
                discussion.content, 
                comment_data
            )

            if best_comment_id:
                best_comment = discussion.comments.filter(id=best_comment_id).first()
                if best_comment and best_comment.user != discussion.author:
                    profile = best_comment.user.profile
                    profile.scholar_points += 50
                    profile.save()
                    
                    discussion.points_awarded = True
                    discussion.save(update_fields=['points_awarded'])
                    
                    # Notify the solver about their reward
                    send_notification(
                        user=best_comment.user,
                        title="ScholarPoints Awarded! 🌟",
                        message=f"Your answer on '{discussion.title}' was chosen as the best solution. You've earned 50 points!"
                    )

                    print(f"DEBUG: Awarded 50 points to {best_comment.user.username} for solving discussion {discussion.id}")
        except Exception as e:
            print(f"DEBUG: Point distribution failed: {str(e)}")

    def perform_destroy(self, instance):
        # Only author or staff can delete the discussion
        if instance.author == self.request.user or self.request.user.is_staff:
            instance.delete()
        else:
            raise PermissionDenied("You are not the author of this post.")

class DiscussionLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            discussion = Discussion.objects.get(pk=pk)
            if discussion.likes.filter(id=request.user.id).exists():
                discussion.likes.remove(request.user)
                return response.Response({'status': 'unliked'}, status=status.HTTP_200_OK)
            else:
                discussion.likes.add(request.user)
                # Notify author about like (if not own post)
                if discussion.author != request.user:
                    send_notification(
                        user=discussion.author,
                        title="Someone liked your post",
                        message=f"{request.user.username} liked your discussion: '{discussion.title}'"
                    )
                return response.Response({'status': 'liked'}, status=status.HTTP_200_OK)
        except Discussion.DoesNotExist:
            return response.Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class DiscussionVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        option_id = request.data.get('option_id')
        try:
            discussion = Discussion.objects.get(pk=pk)
            option = PollOption.objects.get(id=option_id, discussion=discussion)
            
            vote, created = PollVote.objects.get_or_create(
                user=request.user,
                discussion=discussion,
                defaults={'option': option}
            )
            
            if not created:
                vote.option = option
                vote.save()
            
            return response.Response({'status': 'voted'}, status=status.HTTP_200_OK)
        except (Discussion.DoesNotExist, PollOption.DoesNotExist):
            return response.Response({'error': 'Invalid discussion or option'}, status=status.HTTP_400_BAD_REQUEST)

class DiscussionCommentView(generics.CreateAPIView):
    serializer_class = DiscussionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        discussion_id = self.kwargs.get('pk')
        discussion = Discussion.objects.get(pk=discussion_id)
        instance = serializer.save(user=self.request.user, discussion=discussion)
        
        # Notify post author about new comment (if not own post)
        if discussion.author != self.request.user:
            send_notification(
                user=discussion.author,
                title="New Comment on your post",
                message=f"{self.request.user.username} commented on your post: '{discussion.title}'"
            )
