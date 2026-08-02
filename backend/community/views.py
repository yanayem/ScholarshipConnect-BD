from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework import generics, permissions, views
from rest_framework.response import Response
from .models import (
    Discussion, DiscussionComment, PollOption, PollVote, Story, 
    StoryReaction, MentorshipSession, Report, MentorConnection, 
    ChatMessage, MentorReview
)
from .serializers import (
    DiscussionSerializer, DiscussionCommentSerializer, StorySerializer, 
    StoryReactionSerializer, MentorshipSessionSerializer, ReportSerializer, 
    MentorConnectionSerializer, ChatMessageSerializer, MentorReviewSerializer
)
from django.contrib.auth.models import User
from accounts.models import Profile

class DiscussionListCreateView(generics.ListCreateAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class DiscussionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Discussion.objects.all()

class DiscussionLikeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        discussion = get_object_or_404(Discussion, pk=pk)
        if discussion.likes.filter(id=request.user.id).exists():
            discussion.likes.remove(request.user)
            return Response({'status': 'unliked'})
        else:
            discussion.likes.add(request.user)
            return Response({'status': 'liked'})

class DiscussionVoteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        option_id = request.data.get('option_id')
        option = get_object_or_404(PollOption, pk=option_id)
        
        # Remove previous votes for this discussion
        PollVote.objects.filter(user=request.user, discussion_id=pk).delete()
        
        PollVote.objects.create(
            user=request.user,
            discussion_id=pk,
            option=option
        )
        return Response({'status': 'voted'})

class DiscussionCommentView(generics.CreateAPIView):
    serializer_class = DiscussionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        discussion = get_object_or_404(Discussion, pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, discussion=discussion)

class CommentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiscussionComment.objects.all()
    serializer_class = DiscussionCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class StoryListCreateView(generics.ListCreateAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StoryRetrieveView(generics.RetrieveAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

class StoryReactionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        story = get_object_or_404(Story, pk=pk)
        reaction_type = request.data.get('reaction_type', 'like')
        
        reaction, created = StoryReaction.objects.update_or_create(
            story=story, user=request.user,
            defaults={'reaction_type': reaction_type}
        )
        return Response({'status': 'reacted', 'type': reaction_type})

class MentorshipSessionViewSet(generics.ListCreateAPIView):
    serializer_class = MentorshipSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MentorshipSession.objects.filter(models.Q(mentor=user) | models.Q(mentee=user))

    def perform_create(self, serializer):
        serializer.save(mentee=self.request.user)

class MentorshipSessionDetailView(generics.RetrieveUpdateAPIView):
    queryset = MentorshipSession.objects.all()
    serializer_class = MentorshipSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentorListView(generics.ListAPIView):
    serializer_class = DiscussionSerializer # Reusing logic for profiles? Usually it would be ProfileSerializer
    # Placeholder for mentor list
    def get(self, request):
        mentors = Profile.objects.filter(is_staff=True) # or some other criteria
        return Response([])

class ReportListView(generics.ListCreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class ReportActionView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAdminUser]

class MentorConnectionView(generics.ListCreateAPIView):
    serializer_class = MentorConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MentorConnection.objects.filter(models.Q(sender=self.request.user) | models.Q(receiver=self.request.user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class MentorConnectionActionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        connection = get_object_or_404(MentorConnection, pk=pk, receiver=request.user)
        action = request.data.get('action')
        if action == 'accept':
            connection.status = 'accepted'
        elif action == 'reject':
            connection.status = 'rejected'
        connection.save()
        return Response({'status': connection.status})

class ChatMessageView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatMessage.objects.filter(models.Q(sender=user) | models.Q(receiver=user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['other_user_id']
        return ChatMessage.objects.filter(
            (models.Q(sender=user) & models.Q(receiver_id=other_user_id)) |
            (models.Q(sender_id=other_user_id) & models.Q(receiver=user))
        ).order_by('created_at')

class ChatMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChatMessageReactView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        return Response({'status': 'reacted'})

class ConversationListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response([])

class MentorReviewView(generics.ListCreateAPIView):
    queryset = MentorReview.objects.all()
    serializer_class = MentorReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
