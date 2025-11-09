# Generated manually for F-061
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0012_student_soft_delete'),
    ]

    operations = [
        migrations.RenameField(
            model_name='student',
            old_name='address',
            new_name='_address_encrypted',
        ),
        migrations.RenameField(
            model_name='student',
            old_name='guardian_phone_1',
            new_name='_guardian_phone_1_encrypted',
        ),
        migrations.RenameField(
            model_name='student',
            old_name='guardian_phone_2',
            new_name='_guardian_phone_2_encrypted',
        ),
        migrations.RenameField(
            model_name='student',
            old_name='guardian_phone_3',
            new_name='_guardian_phone_3_encrypted',
        ),
        migrations.AlterField(
            model_name='student',
            name='_address_encrypted',
            field=models.TextField(blank=True, db_column='address', max_length=500, null=True, verbose_name='Dirección cifrada'),
        ),
        migrations.AlterField(
            model_name='student',
            name='_guardian_phone_1_encrypted',
            field=models.CharField(db_column='guardian_phone_1', default='Missing PhoneNumber', max_length=200, verbose_name='Teléfono encargado 1 cifrado'),
        ),
        migrations.AlterField(
            model_name='student',
            name='_guardian_phone_2_encrypted',
            field=models.CharField(blank=True, db_column='guardian_phone_2', max_length=200, null=True, verbose_name='Teléfono encargado 2 cifrado'),
        ),
        migrations.AlterField(
            model_name='student',
            name='_guardian_phone_3_encrypted',
            field=models.CharField(blank=True, db_column='guardian_phone_3', max_length=200, null=True, verbose_name='Teléfono encargado 3 cifrado'),
        ),
    ]