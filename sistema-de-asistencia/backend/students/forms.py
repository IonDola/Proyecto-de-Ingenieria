from django import forms
from .models import Student

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ["id_mep", "first_name", "last_name", "section", "active"]
        widgets = {"id_mep": forms.TextInput(attrs={"autofocus": True})}
