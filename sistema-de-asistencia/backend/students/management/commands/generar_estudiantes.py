from django.core.management.base import BaseCommand
from students.models import Student, Action
from django.utils import timezone
import random
from datetime import timedelta, date


class Command(BaseCommand):
    help = "Genera 75 estudiantes y sus acciones, con datos más realistas."

    def handle(self, *args, **kwargs):

        # --- Datos base ---
        first_names = [
            "María", "José", "Ana", "Luis", "Carlos", "Sofía", "Diego", "Elena",
            "Javier", "Lucía", "Andrés", "Valeria", "Pablo", "Camila", "Daniel",
            "Isabella", "Mateo", "Gabriela", "Felipe", "Victoria"
        ]

        surnames_list = [
            "Ramírez", "González", "Mora", "Córdoba", "Rojas",
            "Castro", "Vargas", "Solano", "Pérez", "Sánchez"
        ]

        nationalities = [
            "Costa Rica", "Nicaragua", "Colombia", "Panamá",
            "Estados Unidos", "Venezuela", "El Salvador", "Honduras"
        ]

        birth_places = [
            "San José", "Heredia", "Cartago", "Alajuela", "Guanacaste",
            "Puntarenas", "Limón", "Turrialba", "Pérez Zeledón", "San Carlos"
        ]

        guardian_first_names = [
            "Laura", "María", "Ana", "Rosa", "Elena",
            "Carlos", "Luis", "Juan", "Pedro", "José"
        ]

        guardian_last_names = surnames_list

        guardian_relationships = [
            "Madre", "Padre", "Tío", "Tía", "Abuela", "Abuelo",
            "Hermano", "Hermana", "Tutor Legal"
        ]

        addresses = [
            "Residencial Las Palmas", "Barrio Corazón de Jesús",
            "Urbanización Los Sauces", "Barrio La Florida", "Residencial Altavista",
            "Barrio San Martín", "Urbanización Miravalle", "Residencial Villa Hermosa"
        ]

        action_types = ["ingreso", "egreso", "abandono"]

        matric_levels = [
            "interactivo_ii", "transicion", "primero", "segundo",
            "tercero", "cuarto", "quinto", "sexto", "aula_integrada"
        ]

        current_year = timezone.now().year
        students = []

        # --- Crear estudiantes ---
        for i in range(75):

            # Fecha de nacimiento entre 6 y 12 años
            age = random.randint(6, 12)
            birth_year = current_year - age
            birth_date = date(birth_year, random.randint(1, 12), random.randint(1, 28))

            # Datos del encargado
            guardian_name = (
                random.choice(guardian_first_names)
                + " "
                + random.choice(guardian_last_names)
            )
            guardian_relationship = random.choice(guardian_relationships)

            s = Student(
                id_mep=f"STU-{1000+i}",
                first_name=random.choice(first_names),
                surnames=random.choice(surnames_list) + " " + random.choice(surnames_list),
                section=random.choice(["1-1", "2-3", "5-4"]),
                nationality=random.choice(nationalities),
                birth_date=birth_date,
                birth_place=random.choice(birth_places),
                gender=random.choice(["Femenino", "Masculino", "Indefinido"]),
                ongoing_age=str(age),
                ongoing_age_year=str(current_year),
                guardian_name_1=guardian_name,
                guardian_id_1=f"ID-{i}",
                guardian_relationship_1=guardian_relationship,
                institutional_guardian=guardian_name
            )

            # Campos cifrados
            s.address = f"{random.choice(addresses)}, Casa #{random.randint(1, 200)}"
            s.guardian_phone_1 = f"88{random.randint(100000, 999999)}"

            s.save()
            students.append(s)

        # --- Crear acciones para cada estudiante ---
        for student in students:
            for _ in range(random.randint(1, 3)):
                t = random.choice(action_types)

                transferred = False
                origin_school = None

                if t == "ingreso":
                    transferred = random.choice([True, False])
                    origin_school = "Escuela Random" if transferred else None

                Action.objects.create(
                    student=student,
                    type=t,
                    notes="Registro creado automáticamente.",
                    actor="Demo",
                    last_edition_by="Demo",
                    on_revision=random.choice([True, False]),
                    origin_school=origin_school,
                    transferred=transferred,
                    matriculate_level=random.choice(matric_levels),
                )

        self.stdout.write(self.style.SUCCESS("✔ Se generaron 75 estudiantes realistas y sus acciones."))
