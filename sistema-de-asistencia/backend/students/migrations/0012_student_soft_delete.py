# Generated manually for F-039
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0011_remove_student_active_alter_action_matriculate_level'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='is_deleted',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='student',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='student',
            name='deleted_by',
            field=models.CharField(blank=True, default='', max_length=150),
        ),
    ]