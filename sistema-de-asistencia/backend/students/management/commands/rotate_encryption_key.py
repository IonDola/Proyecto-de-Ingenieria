"""
F-061: Comando para rotar la clave de cifrado AES
Uso: python manage.py rotate_encryption_key --old-key OLD_KEY --new-key NEW_KEY
"""
from django.core.management.base import BaseCommand
from students.models import Student
from students.encryption import rotate_encryption_key, re_encrypt_field
import os

class Command(BaseCommand):
    help = 'Rota la clave de cifrado AES para todos los campos sensibles'

    def add_arguments(self, parser):
        parser.add_argument('--old-key', type=str, required=True, help='Clave de cifrado antigua')
        parser.add_argument('--new-key', type=str, required=True, help='Clave de cifrado nueva')

    def handle(self, *args, **options):
        old_key = options['old_key']
        new_key = options['new_key']

        self.stdout.write('Iniciando rotación de clave...')

        try:
            old_fernet, new_fernet = rotate_encryption_key(old_key, new_key)
            
            students = Student.objects.all()
            total = students.count()
            processed = 0

            for student in students:
                # Re-cifrar dirección
                if student._address_encrypted:
                    student._address_encrypted = re_encrypt_field(
                        student._address_encrypted, 
                        old_fernet, 
                        new_fernet
                    )
                
                # Re-cifrar teléfonos
                if student._guardian_phone_1_encrypted:
                    student._guardian_phone_1_encrypted = re_encrypt_field(
                        student._guardian_phone_1_encrypted,
                        old_fernet,
                        new_fernet
                    )
                
                if student._guardian_phone_2_encrypted:
                    student._guardian_phone_2_encrypted = re_encrypt_field(
                        student._guardian_phone_2_encrypted,
                        old_fernet,
                        new_fernet
                    )
                
                if student._guardian_phone_3_encrypted:
                    student._guardian_phone_3_encrypted = re_encrypt_field(
                        student._guardian_phone_3_encrypted,
                        old_fernet,
                        new_fernet
                    )
                
                student.save()
                processed += 1
                
                if processed % 10 == 0:
                    self.stdout.write(f'Procesados: {processed}/{total}')

            # Actualizar variable de entorno
            os.environ['ENCRYPTION_KEY'] = new_key

            self.stdout.write(self.style.SUCCESS(f'✓ Rotación completada: {processed} estudiantes actualizados'))
            self.stdout.write(self.style.WARNING('IMPORTANTE: Actualiza ENCRYPTION_KEY en tu archivo .env con la nueva clave'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la rotación: {str(e)}'))
            raise