from django.core.management.base import BaseCommand
from students.models import Student

class Command(BaseCommand):
    help = 'Cifra los datos sensibles existentes en la base de datos'

    def handle(self, *args, **options):
        self.stdout.write('Cifrando datos existentes...')

        qs = Student.objects.all()
        total = qs.count()
        processed = 0

        for student in qs:
            # Reasignar para DISPARAR los setters (cifran internamente)
            student.address = student.address
            student.guardian_phone_1 = student.guardian_phone_1
            student.guardian_phone_2 = student.guardian_phone_2
            student.guardian_phone_3 = student.guardian_phone_3

            student.save(update_fields=[
                '_address_encrypted',
                '_guardian_phone_1_encrypted',
                '_guardian_phone_2_encrypted',
                '_guardian_phone_3_encrypted',
                'updated_at',
            ])

            processed += 1
            if processed % 10 == 0:
                self.stdout.write(f'Procesados: {processed}/{total}')

        self.stdout.write(self.style.SUCCESS(f' Cifrado completado: {processed} estudiantes actualizados'))
