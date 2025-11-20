from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
import uuid
from .encryption import encrypt_field, decrypt_field

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

    nationality = models.CharField("Nacionalidad", max_length=60, default="Costa Rica")
    birth_date = models.DateField("Fecha de nacimiento", default=timezone.now)
    birth_place = models.TextField("Lugar de Nacimiento",  max_length=60, null=True, blank=True)
    
    # F-061: Campo cifrado - dirección
    _address_encrypted = models.TextField("Dirección cifrada", max_length=500, null=True, blank=True, db_column="address")
    
    gender = models.CharField("Género", max_length=15, choices=GENDER_CHOICES, default="Indefinido")
    ongoing_age = models.TextField("Edad cumplida el presente año", max_length=2, null=True, blank=False)
    ongoing_age_year = models.TextField("Año de referencia", max_length=4, null=True, blank=False)

    # F-061: Encargados con teléfonos cifrados
    guardian_name_1 = models.CharField("Nombre encargado 1", max_length=120, default="Missing Parent")
    guardian_id_1 = models.CharField("Cédula encargado 1", max_length=50, default="Missing ID")
    _guardian_phone_1_encrypted = models.CharField("Teléfono encargado 1 cifrado", max_length=200, default="Missing PhoneNumber", db_column="guardian_phone_1")
    guardian_relationship_1 = models.CharField("Parentesco al estudiante 1", max_length=30, default="Missing PhoneNumber")

    guardian_name_2 = models.CharField("Nombre encargado 2", max_length=120, null=True, blank=True)
    guardian_id_2 = models.CharField("Cédula encargado 2", max_length=50, null=True, blank=True)
    _guardian_phone_2_encrypted = models.CharField("Teléfono encargado 2 cifrado", max_length=200, null=True, blank=True, db_column="guardian_phone_2")
    guardian_relationship_2 = models.CharField("Parentesco al estudiante 2", max_length=30, default="Missing PhoneNumber")

    guardian_name_3 = models.CharField("Nombre encargado 3", max_length=120, null=True, blank=True)
    guardian_id_3 = models.CharField("Cédula encargado 3", max_length=50, null=True, blank=True)
    _guardian_phone_3_encrypted = models.CharField("Teléfono encargado 3 cifrado", max_length=200, null=True, blank=True, db_column="guardian_phone_3")
    guardian_relationship_3 = models.CharField("Parentesco al estudiante 3", max_length=30, default="Missing PhoneNumber")

    institutional_guardian = models.CharField("Nombre encargado 1", max_length=120, default="Missing Parent")

    # F-039: Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.CharField(max_length=150, blank=True, default="")

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    # F-061: Properties para cifrado/descifrado transparente
    @property
    def address(self):
        """Descifra y retorna la dirección"""
        return decrypt_field(self._address_encrypted or "")
    
    @address.setter
    def address(self, value):
        """Cifra y guarda la dirección"""
        self._address_encrypted = encrypt_field(value or "")

    @property
    def guardian_phone_1(self):
        return decrypt_field(self._guardian_phone_1_encrypted or "")
    
    @guardian_phone_1.setter
    def guardian_phone_1(self, value):
        self._guardian_phone_1_encrypted = encrypt_field(value or "")

    @property
    def guardian_phone_2(self):
        return decrypt_field(self._guardian_phone_2_encrypted or "")
    
    @guardian_phone_2.setter
    def guardian_phone_2(self, value):
        self._guardian_phone_2_encrypted = encrypt_field(value or "")

    @property
    def guardian_phone_3(self):
        return decrypt_field(self._guardian_phone_3_encrypted or "")
    
    @guardian_phone_3.setter
    def guardian_phone_3(self, value):
        self._guardian_phone_3_encrypted = encrypt_field(value or "")

    class Meta:
        ordering = ["surnames", "first_name"]

    def __str__(self):
        return f"{self.surnames}, {self.first_name} ({self.id_mep}) ({self.id})"

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
    matriculate_level = models.CharField("Nivel a| Matricular", max_length=20, choices=MATRICLE_CHOICES, db_index=True, default="primero")

    def clean(self):
        if self.type == "ingreso":
            if (self.transferred and not self.origin_school) or (self.origin_school and not self.transferred):
                raise ValidationError("Para estudiantes transferidos debe indicar su procedencia.")
            if not self.matriculate_level:
                raise ValidationError("Ingresar el nivel al que va a matricular")

    class Meta:
        ordering = ["-created_at"]