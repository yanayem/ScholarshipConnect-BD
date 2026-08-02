from rest_framework import serializers
from .models import Discussion, DiscussionComment, PollOption, PollVote, Story, StoryReaction, MentorshipSession, Report, MentorConnection, ChatMessage, MentorReview
from django.contrib.auth.models import User
from accounts.models import Profile

class MentorReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.profile.full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = MentorReview
        fields = ['id', 'mentor', 'user', 'user_name', 'user_avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_user_avatar(self, obj):
        try: return obj.user.profile.avatar_url
        except: return ""

    def to_internal_value(self, data):
        # Handle cases where mentor ID might be a Profile ID
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if isinstance(data, dict) else data

        if 'mentor' in data:
            mentor_val = data['mentor']
            try:
                # If it's not a valid User ID, check if it's a Profile ID
                # We check for numeric string or integer
                if str(mentor_val).isdigit():
                    if not User.objects.filter(id=int(mentor_val)).exists():
                        profile = Profile.objects.filter(id=int(mentor_val)).first()
                        if profile:
                            data['mentor'] = profile.user.id
            except (ValueError, TypeError):
                pass
                
        return super().to_internal_value(data)

class PollOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'votes_count']

class DiscussionCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    author_email = serializers.CharField(source='user.email', read_only=True)
    author_avatar_url = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionComment
        fields = [
            'id', 'user', 'author_name', 'author_full_name', 'author_email', 
            'author_avatar_url', 'content', 'created_at', 'is_author'
        ]
        read_only_fields = ['user']

    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_author_full_name(self, obj):
        try:
            return obj.user.profile.full_name or obj.user.username
        except:
            return obj.user.username

    def get_author_avatar_url(self, obj):
        try:
            return obj.user.profile.avatar_url
        except:
            return ""

class DiscussionSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    title = serializers.CharField(required=False)
    content = serializers.CharField(required=False)
    category = serializers.ChoiceField(choices=Discussion.CATEGORY_CHOICES, required=False)
    author_full_name = serializers.SerializerMethodField()
    author_email = serializers.CharField(source='author.email', read_only=True)
    author_avatar_url = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    comments = DiscussionCommentSerializer(many=True, read_only=True)
    poll_options = PollOptionSerializer(many=True, read_only=True)
    user_voted_option_id = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'author', 'author_name', 'author_full_name', 
            'author_email', 'author_avatar_url', 'author_role',
            'content', 'category', 'is_solved', 'image', 'poll_question',
            'poll_options', 'user_voted_option_id',
            'likes_count', 'is_liked', 'comments_count', 'comments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author']

    def get_author_full_name(self, obj):
        try:
            return obj.author.profile.full_name or obj.author.username
        except:
            return obj.author.username

    def get_author_avatar_url(self, obj):
        try:
            return obj.author.profile.avatar_url
        except:
            return ""

    def get_author_role(self, obj):
        if obj.author.is_staff:
            return "Staff"
        return "Student"

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_user_voted_option_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.poll_votes.filter(user=request.user).first()
            return vote.option.id if vote else None
        return None

class StoryReactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = StoryReaction
        fields = ['id', 'user', 'user_name', 'reaction_type', 'created_at']
        read_only_fields = ['user']

class StorySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    author_avatar_url = serializers.SerializerMethodField()
    reactions = StoryReactionSerializer(many=True, read_only=True)
    reactions_count = serializers.IntegerField(source='reactions.count', read_only=True)
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id', 'user', 'author_name', 'author_full_name', 'author_avatar_url',
            'media', 'caption', 'reactions', 'reactions_count', 'user_reaction',
            'created_at'
        ]
        read_only_fields = ['user']

    def get_author_full_name(self, obj):
        try:
            return obj.user.profile.full_name or obj.user.username
        except:
            return obj.user.username

    def get_author_avatar_url(self, obj):
        try:
            return obj.user.profile.avatar_url
        except:
            return ""

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            return reaction.reaction_type if reaction else None
        return None
