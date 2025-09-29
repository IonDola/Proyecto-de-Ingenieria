from django import forms
from .models import Student

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["id_mep", "first_name", "last_name", "section", "active"]
        error_messages = {
            "id_mep": {
                "unique": "Carnet/ID duplicado. Ya existe un estudiante con ese identificador.",
            }
        }
