from django.db import models
from django.utils import timezone
import uuid

class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_mep = models.CharField("Carnet/ID", max_length=32, unique=True)
    first_name = models.CharField("Nombre", max_length=80)
    last_name = models.CharField("Apellidos", max_length=120)
    section = models.CharField("Sección", max_length=20, blank=True, default="")
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.last_name}, {self.first_name} ({self.id_mep})"

class Action(models.Model):
    TYPE_CHOICES = [
        ("ingreso", "Ingreso"),
        ("egreso", "Egreso"),
        ("abandono", "Abandono"),
        ("transferencia", "Transferencia"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="actions")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now, editable=False, db_index=True)
    actor = models.CharField(max_length=80, blank=True, default="")

    class Meta:
        ordering = ["-created_at"]
