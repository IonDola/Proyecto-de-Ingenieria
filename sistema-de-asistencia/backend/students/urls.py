from django.urls import path
from . import views

app_name = "students"

urlpatterns = [
    path("", views.student_list, name="home"), # redirect root to student list de momento !!!!!!!!

    path("students/", views.student_list, name="student_list"),
    path("students/new/", views.student_create, name="student_create"),
    path("students/<uuid:pk>/", views.student_detail, name="student_detail"),
    path("students/<uuid:pk>/edit/", views.student_edit, name="student_edit"),

    path("students/<uuid:student_id>/history/", views.history_list, name="history_list"),
    path("students/<uuid:student_id>/history/<uuid:action_id>/", views.history_detail, name="history_detail"),
]
