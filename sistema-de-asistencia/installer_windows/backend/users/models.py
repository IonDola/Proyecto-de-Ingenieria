from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class CustomUser(AbstractUser):
    GENDER_CHOICES = [
        ("Femenino", "Femenino"),
        ("Masculino", "Masculino"),
        ("Indefinido", "Indefinido"),
    ]
    class Role(models.TextChoices):
        DEV = "DEV", "Desarrollador"
        ADMIN = "ADMIN", "Administrativo"
        VISITOR = "VISITOR", "Visitante"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.ADMIN
    )

    gender = models.CharField("Género", max_length=15, choices=GENDER_CHOICES, default="Indefinido")

    # Campos para usuarios VISITOR 
    visitor_code = models.CharField(
        max_length=8, unique=True, null=True, blank=True,
        help_text="Código visible para el visitante (clave)."
    )
    visitor_expires_at = models.DateField(
        null=True, blank=True,
        help_text="Fecha de expiración de la clave."
    )
    visitor_suspended_at = models.DateTimeField(
        null=True, blank=True,
        help_text="Si se establece, el visitante está suspendido."
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="created_visitors",
        help_text="Administrador que creó este visitante."
    )
