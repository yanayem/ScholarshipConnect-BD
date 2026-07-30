from rest_framework import serializers
from .models import SavedScholarship, ScholarshipApplication, UserDocument
from scholarships.serializers import ScholarshipSerializer

class SavedScholarshipSerializer(serializers.ModelSerializer):
    scholarship_details = ScholarshipSerializer(source='scholarship', read_only=True)

    class Meta:
        model = SavedScholarship
        fields = ['id', 'user', 'scholarship', 'scholarship_details', 'created_at']
        read_only_fields = ['user']
