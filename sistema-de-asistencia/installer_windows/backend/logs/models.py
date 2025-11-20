import uuid
from django.conf import settings
from django.db import models

class PersonalLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_logs")
    timestamp = models.DateTimeField(auto_now_add=True)

    action = models.CharField(max_length=120)
    type = models.CharField(max_length=60)          
    entity = models.CharField(max_length=240, blank=True, default="")
    status = models.CharField(max_length=30, default="success")
    metadata = models.JSONField(blank=True, default=dict)

    class Meta:
        db_table = "logs_personallog"
        ordering = ["-timestamp"]
