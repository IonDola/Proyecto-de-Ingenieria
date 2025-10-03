# backend/students/urls.py
from django.urls import path
from . import views
from students import api as students_api

app_name = "students"

urlpatterns = [
    path("", views.student_list, name="home"),

    path("students/", views.student_list, name="student_list"),
    path("students/new/", views.student_create, name="student_create"),
    path("students/<uuid:pk>/", views.student_detail, name="student_detail"),
    path("students/<uuid:pk>/edit/", views.student_edit, name="student_edit"),

    path("students/<uuid:student_id>/history/", views.history_list, name="history_list"),
    path("students/<uuid:student_id>/history/<uuid:action_id>/", views.history_detail, name="history_detail"),

    path("api/students/", students_api.students_list),
    path("api/students/new/", students_api.students_create),
    path("api/students/<uuid:student_id>/", students_api.students_detail),
    path("api/students/<uuid:student_id>/update/", students_api.students_update),
    path("api/students/<uuid:student_id>/history/", students_api.student_history),
    path("api/actions/<uuid:action_id>/", students_api.action_detail),
    path("api/students/bulk-delete/", students_api.students_bulk_delete),  # POST

    path("api/students/<uuid:student_id>/actions/", students_api.actions_list_by_student),
    path("api/students/<uuid:student_id>/actions/new/", students_api.actions_create),
    path("api/actions/<uuid:action_id>/update/", students_api.actions_update),
    path("api/actions/<uuid:action_id>/delete/", students_api.actions_delete),

    path("api/actions/", students_api.actions_list),                  
    path("api/actions/new/", students_api.actions_create_global),         
    path("api/actions/bulk-delete/", students_api.actions_bulk_delete), 
]
