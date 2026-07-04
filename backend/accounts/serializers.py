from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'full_name', 'phone_number', 
            'date_of_birth', 'cgpa', 'academic_level', 'department', 
            'university', 'target_countries', 'preferred_fields', 'bio', 
            'linkedin_url', 'github_url', 'facebook_url',
            'profile_picture', 'profile_picture_url'
        ]

    def validate_cgpa(self, value):
        if value is not None and (value < 0 or value > 4.0):
            raise serializers.ValidationError("CGPA must be between 0 and 4.0")
        return value

    def update(self, instance, validated_data):
        # Extract user data
        user_data = validated_data.pop('user', {})
        email = user_data.get('email')

        # Update User email if provided
        if email:
            instance.user.email = email
            instance.user.save()

        # Update Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
