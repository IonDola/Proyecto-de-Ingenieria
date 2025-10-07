import uuid
from django.db import models
from django.conf import settings

class PersonalLog(models.Model):
    class ActionType(models.TextChoices):
        CREATE = "create", "Creación"
        UPDATE = "update", "Edición"
        DELETE = "delete", "Eliminación"
        READ   = "read",   "Consulta"

    class Status(models.TextChoices):
        SUCCESS = "success", "Exitoso"
        FAILED  = "failed",  "Fallido"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_logs")
    timestamp = models.DateTimeField(auto_now_add=True)

    action = models.CharField(max_length=120)           # “Registrar ingreso”, “Editar acción”, etc.
    type = models.CharField(max_length=16, choices=ActionType.choices)
    entity = models.CharField(max_length=200, blank=True)   # “Estudiante: …”
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SUCCESS)
    metadata = models.JSONField(blank=True, null=True)      # opcional (ids, diffs, payload)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.timestamp:%Y-%m-%d %H:%M} · {self.action} · {self.entity or ''}"
