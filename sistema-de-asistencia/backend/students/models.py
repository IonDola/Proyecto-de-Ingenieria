from django.db import models
from django.utils import timezone
import uuid

class Student(models.Model):
    GENDER_CHOICES = [
        ("Femenino", "Femenino"),
        ("Masculino", "Masculino"),
        ("Indefinido", "Indefinido"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_mep = models.CharField("Carnet/ID", max_length=32, unique=True)
    first_name = models.CharField("Nombre", max_length=80)
    last_name = models.CharField("Apellidos", max_length=120)
    section = models.CharField("Sección", max_length=20, blank=True, default="")
    active = models.BooleanField(default=True)

    nationality = models.CharField("Nacionalidad", max_length=60, default="Costa Rica")
    birth_date = models.DateField("Fecha de nacimiento", default=timezone.now)
    address = models.TextField("Dirección de residencia", null=True, blank=True)
    gender = models.CharField("Género", max_length=15, choices=GENDER_CHOICES, default="Indefinido")

    # Encargados
    guardian_name_1 = models.CharField("Nombre encargado 1", max_length=120, default="Missing Parent")
    guardian_id_1 = models.CharField("Cédula encargado 1", max_length=50, default="Missing ID")
    guardian_phone_1 = models.CharField("Teléfono encargado 1", max_length=30, default="Missing PhoneNumber")

    guardian_name_2 = models.CharField("Nombre encargado 2", max_length=120, null=True, blank=True)
    guardian_id_2 = models.CharField("Cédula encargado 2", max_length=50, null=True, blank=True)
    guardian_phone_2 = models.CharField("Teléfono encargado 2", max_length=30, null=True, blank=True)

    guardian_name_3 = models.CharField("Nombre encargado 3", max_length=120, null=True, blank=True)
    guardian_id_3 = models.CharField("Cédula encargado 3", max_length=50, null=True, blank=True)
    guardian_phone_3 = models.CharField("Teléfono encargado 3", max_length=30, null=True, blank=True)

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
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="actions")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now, editable=False, db_index=True)
    actor = models.CharField(max_length=80, blank=True, default="")

    transferred = models.BooleanField(default=False)
    on_revision = models.BooleanField(default=True)
    origin_school = models.CharField("Escuela de origen", max_length=120, null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
