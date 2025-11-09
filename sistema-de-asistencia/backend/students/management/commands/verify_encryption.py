"""
F-061: Comando para verificar que el cifrado funciona correctamente
Uso: python manage.py verify_encryption
"""
from django.core.management.base import BaseCommand
from students.models import Student
from students.encryption import encrypt_field, decrypt_field

class Command(BaseCommand):
    help = 'Verifica que el cifrado/descifrado AES funciona correctamente'

    def handle(self, *args, **options):
        self.stdout.write('=== Verificación de Cifrado AES ===\n')

        # Test 1: Cifrado/descifrado básico
        self.stdout.write('Test 1: Cifrado y descifrado básico')
        test_data = "Dirección de prueba 123"
        encrypted = encrypt_field(test_data)
        decrypted = decrypt_field(encrypted)
        
        if decrypted == test_data:
            self.stdout.write(self.style.SUCCESS(f' Cifrado básico funciona'))
            self.stdout.write(f'  Original: {test_data}')
            self.stdout.write(f'  Cifrado: {encrypted[:50]}...')
            self.stdout.write(f'  Descifrado: {decrypted}')
        else:
            self.stdout.write(self.style.ERROR(f' Error en cifrado básico'))
            return

        # Test 2: Verificar que los datos en DB están cifrados
        self.stdout.write('\nTest 2: Verificación de campos en base de datos')
        students = Student.objects.all()[:5]
        
        if not students:
            self.stdout.write(self.style.WARNING('No hay estudiantes en la base de datos para verificar'))
            return

        for student in students:
            self.stdout.write(f'\n  Estudiante: {student.first_name} {student.surnames}')
            
            # Verificar dirección
            if student._address_encrypted:
                self.stdout.write(f'    Dirección cifrada (DB): {student._address_encrypted[:40]}...')
                self.stdout.write(f'    Dirección descifrada: {student.address}')
                
                # Verificar que NO son iguales (está cifrado)
                if student._address_encrypted != student.address:
                    self.stdout.write(self.style.SUCCESS('     Dirección está cifrada'))
                else:
                    self.stdout.write(self.style.ERROR('     Dirección NO está cifrada'))
            
            # Verificar teléfonos
            if student._guardian_phone_1_encrypted:
                self.stdout.write(f'    Teléfono 1 cifrado (DB): {student._guardian_phone_1_encrypted[:40]}...')
                self.stdout.write(f'    Teléfono 1 descifrado: {student.guardian_phone_1}')
                
                if student._guardian_phone_1_encrypted != student.guardian_phone_1:
                    self.stdout.write(self.style.SUCCESS('     Teléfono 1 está cifrado'))
                else:
                    self.stdout.write(self.style.ERROR('     Teléfono 1 NO está cifrado'))

        self.stdout.write(self.style.SUCCESS('\n Verificación completada'))
