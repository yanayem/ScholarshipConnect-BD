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
