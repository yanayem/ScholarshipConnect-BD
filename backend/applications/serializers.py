from rest_framework import serializers
from .models import SavedScholarship, ScholarshipApplication, UserDocument
from scholarships.serializers import ScholarshipSerializer

class SavedScholarshipSerializer(serializers.ModelSerializer):
    scholarship_details = ScholarshipSerializer(source='scholarship', read_only=True)

    class Meta:
        model = SavedScholarship
        fields = ['id', 'user', 'scholarship', 'scholarship_details', 'created_at']
        read_only_fields = ['user']

class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    scholarship_title = serializers.CharField(source='scholarship.title', read_only=True)
    scholarship_country = serializers.CharField(source='scholarship.country', read_only=True)

    class Meta:
        model = ScholarshipApplication
        fields = [
            'id', 'user', 'scholarship', 'scholarship_title', 'scholarship_country',
            'status', 'full_name', 'email', 'phone', 'university', 'sop', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = ['id', 'user', 'name', 'doc_type', 'file_url', 'size', 'created_at']
        read_only_fields = ['user']
