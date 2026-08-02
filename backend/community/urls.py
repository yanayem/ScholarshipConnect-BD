from django.urls import path
from .views import (
    DiscussionListCreateView, 
    DiscussionRetrieveUpdateDestroyView,
    DiscussionLikeView,
    DiscussionVoteView,
    DiscussionCommentView,
    CommentRetrieveUpdateDestroyView,
    StoryListCreateView,
    StoryRetrieveView,
    StoryReactionView,
)


urlpatterns = [
    path('', DiscussionListCreateView.as_view(), name='discussion-list'),
    path('reviews/', MentorReviewView.as_view(), name='mentor-review'),
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('reports/<int:pk>/', ReportActionView.as_view(), name='report-detail'),
    path('<int:pk>/', DiscussionRetrieveUpdateDestroyView.as_view(), name='discussion-detail'),
    path('<int:pk>/like/', DiscussionLikeView.as_view(), name='discussion-like'),
    path('<int:pk>/vote/', DiscussionVoteView.as_view(), name='discussion-vote'),
    path('<int:pk>/comment/', DiscussionCommentView.as_view(), name='discussion-comment'),
    path('comments/<int:pk>/', CommentRetrieveUpdateDestroyView.as_view(), name='comment-detail'),
    
    # Story endpoints
    path('stories/', StoryListCreateView.as_view(), name='story-list'),
    path('stories/<int:pk>/', StoryRetrieveView.as_view(), name='story-detail'),
    path('stories/<int:pk>/react/', StoryReactionView.as_view(), name='story-react'),
