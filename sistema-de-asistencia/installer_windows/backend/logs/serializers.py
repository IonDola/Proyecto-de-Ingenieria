from rest_framework import serializers
from .models import PersonalLog

class PersonalLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalLog
        fields = ["id", "timestamp", "action", "type", "entity", "status", "metadata"]
