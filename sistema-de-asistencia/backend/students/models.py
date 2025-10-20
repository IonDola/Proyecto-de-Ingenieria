from django.core.exceptions import ValidationError
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
    surnames = models.CharField("Apellidos", max_length=120)
    section = models.CharField("Sección", max_length=20, blank=True, default="")
    active = models.BooleanField(default=True)

    nationality = models.CharField("Nacionalidad", max_length=60, default="Costa Rica")
    birth_date = models.DateField("Fecha de nacimiento", default=timezone.now)
    birth_place = models.TextField("Lugar de Nacimiento",  max_length=60, null=True, blank=True)
    address = models.TextField("Dirección de residencia",  max_length=120, null=True, blank=True)
    gender = models.CharField("Género", max_length=15, choices=GENDER_CHOICES, default="Indefinido")
    ongoing_age = models.TextField("Edad cumplida el presente año", max_length=2, null=True, blank=False)
    ongoing_age_year = models.TextField("Año de referencia", max_length=4, null=True, blank=False)

    # Encargados
    guardian_name_1 = models.CharField("Nombre encargado 1", max_length=120, default="Missing Parent")
    guardian_id_1 = models.CharField("Cédula encargado 1", max_length=50, default="Missing ID")
    guardian_phone_1 = models.CharField("Teléfono encargado 1", max_length=30, default="Missing PhoneNumber")
    guardian_relationship_1 = models.CharField("Parentesco al estudiante 1", max_length=30, default="Missing PhoneNumber")

    guardian_name_2 = models.CharField("Nombre encargado 2", max_length=120, null=True, blank=True)
    guardian_id_2 = models.CharField("Cédula encargado 2", max_length=50, null=True, blank=True)
    guardian_phone_2 = models.CharField("Teléfono encargado 2", max_length=30, null=True, blank=True)
    guardian_relationship_2 = models.CharField("Parentesco al estudiante 2", max_length=30, default="Missing PhoneNumber")

    guardian_name_3 = models.CharField("Nombre encargado 3", max_length=120, null=True, blank=True)
    guardian_id_3 = models.CharField("Cédula encargado 3", max_length=50, null=True, blank=True)
    guardian_phone_3 = models.CharField("Teléfono encargado 3", max_length=30, null=True, blank=True)
    guardian_relationship_3 = models.CharField("Parentesco al estudiante 3", max_length=30, default="Missing PhoneNumber")

    institutional_guardian = models.CharField("Nombre encargado 1", max_length=120, default="Missing Parent")

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["surnames", "first_name"]

    def __str__(self):
        return f"{self.surnames}, {self.first_name} ({self.id_mep})"

class Action(models.Model):
    TYPE_CHOICES = [
        ("ingreso", "Ingreso"),
        ("egreso", "Egreso"),
        ("abandono", "Abandono"),
    ]
    MATRICLE_CHOICES = [
        ("interactivo_ii", "Interactivo_II"),
        ("transicion", "Transicion"),
        ("primero", "Primero"),
        ("segundo", "Segundo"),
        ("tercero", "Tercero"),
        ("cuarto", "Cuarto"),
        ("quinto", "Quinto"),
        ("sexto", "Sexto"),
        ("aula_integrada", "Aula_Integrada"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="actions")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    notes = models.TextField("Observaciones", blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now, editable=False, db_index=True)
    actor = models.CharField(max_length=80, blank=True, default="")
    last_edition_by = models.CharField(max_length=80, blank=True, default="")
    on_revision = models.BooleanField(default=True)

    origin_school = models.CharField("Escuela de origen", max_length=120, null=True, blank=True)
    transferred = models.BooleanField(default=False)
    matriculate_level = models.CharField("Nivel a Matricular", max_length=20, choices=MATRICLE_CHOICES, db_index=True, default="primero")

    "Reglas del negocio"
    def clean(self):
            if self.type == "ingreso":
                if (self.transferred and not self.origin_school) or (self.origin_school and not self.transferred):
                    raise ValidationError("Para estudiantes transferidos debe indicar su procedencia.")
                if not self.matriculate_level:
                    raise ValidationError("Ingresar el nivel al que va a matricular")



    class Meta:
        ordering = ["-created_at"]
