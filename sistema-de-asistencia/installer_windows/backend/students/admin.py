from django.contrib import admin
from .models import Student, Action

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id_mep", "first_name", "surnames", "section", "created_at", "updated_at")
    search_fields = ("id_mep", "first_name", "surnames")

@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ("type", "student", "actor", "created_at")
    search_fields = ("student__id_mep", "student__first_name", "student__surnames", "notes", "actor")
    list_filter = ("type", "created_at")
