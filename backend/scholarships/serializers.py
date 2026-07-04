from rest_framework import serializers
from .models import Scholarship

class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = '__all__'

    def validate_min_cgpa(self, value):
        if value == '':
            return None
        return value
