from rest_framework import serializers
from .models import AIChatMessage

class AIChatMessageSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    class Meta:
        model = AIChatMessage
        fields = ['id', 'message', 'is_user', 'created_at']

    def get_id(self, obj):
        if hasattr(obj, '_id') and obj._id:
            return str(obj._id)
        if obj.pk is not None:
            return str(obj.pk)
        return None
