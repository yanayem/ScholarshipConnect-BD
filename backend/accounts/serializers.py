from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email')
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'is_staff', 'full_name', 'phone_number',
            'date_of_birth', 'cgpa', 'academic_level', 'department', 
            'university', 'target_countries', 'preferred_fields', 'bio', 
            'linkedin_url', 'github_url', 'facebook_url',
            'profile_picture', 'profile_picture_url', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'is_staff', 'updated_at']

    def validate_cgpa(self, value):
        if value is not None:
            if value < 0 or value > 4.0:
                raise serializers.ValidationError("CGPA must be between 0.0 and 4.0")
        return value

    def update(self, instance, validated_data):
        # Handle nested User data (email)
        user_data = validated_data.pop('user', {})
        new_email = user_data.get('email')

        if new_email and instance.user.email != new_email:
            # Check if email is already taken by another user
            if User.objects.exclude(pk=instance.user.pk).filter(email=new_email).exists():
                raise serializers.ValidationError({"email": "This email is already in use by another account."})
            instance.user.email = new_email
            instance.user.save()

        # Update remaining Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'profile']
        read_only_fields = ['id', 'is_staff']
