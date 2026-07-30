from rest_framework import serializers
from .models import Scholarship

class ScholarshipSerializer(serializers.ModelSerializer):
    submitter_email = serializers.ReadOnlyField(source='submitted_by.email')
    
    class Meta:
        model = Scholarship
        fields = '__all__'
        read_only_fields = ['submitted_by', 'status', 'created_at', 'updated_at']

    def validate_min_cgpa(self, value):
        try:
            if value is None or value == '':
                return 0.00
            return float(value)
        except (ValueError, TypeError):
            return 0.00
class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    scholarship_title = serializers.CharField(source='scholarship.title', read_only=True)
    scholarship_country = serializers.CharField(source='scholarship.country', read_only=True)
    scholarship_level = serializers.CharField(source='scholarship.level', read_only=True)
    scholarship_deadline = serializers.DateField(source='scholarship.deadline', read_only=True)
    user_documents = serializers.SerializerMethodField()

    class Meta:
        model = ScholarshipApplication
        fields = [
            'id', 'user', 'scholarship', 'scholarship_title', 'scholarship_country',
            'scholarship_level', 'scholarship_deadline',
            'status', 'application_type', 'full_name', 'email', 'phone', 'university', 
            'cgpa', 'ielts_score', 'academic_level', 'sop', 'user_documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

    def get_user_documents(self, obj):
        # Only include documents if request is by staff or the owner
        request = self.context.get('request')
        if request and (request.user.is_staff or request.user == obj.user):
            docs = UserDocument.objects.filter(user=obj.user)
            return UserDocumentSerializer(docs, many=True).data
        return []

class UserDocumentSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()

    class Meta:
        model = UserDocument
        fields = ['id', 'user', 'name', 'doc_type', 'file', 'size', 'expiry_date', 'status', 'created_at', 'updated_at']
        read_only_fields = ['user', 'size']
