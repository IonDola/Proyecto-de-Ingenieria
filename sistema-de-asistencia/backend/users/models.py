from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        DEV = "DEV", "Desarrollador"
        ADMIN = "ADMIN", "Administrativo"
        VISITOR = "VISITOR", "Visitante"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.VISITOR
    )
