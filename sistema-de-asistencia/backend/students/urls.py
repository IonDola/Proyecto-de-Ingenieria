from django.urls import path
from students import api as students_api

app_name = "students"

urlpatterns = [
    path("api/students/", students_api.students_list),
    path("api/students/new/", students_api.students_create),
    path("api/students/<uuid:student_id>/", students_api.students_detail),
    path("api/students/<uuid:student_id>/update/", students_api.students_update),
    path("api/students/<uuid:student_id>/history/", students_api.student_history),

    path("api/students/<uuid:student_id>/export-pdf/", students_api.export_student_pdf),

    path("api/actions/<uuid:action_id>/", students_api.action_detail),

    path("api/students/bulk-soft-delete/", students_api.students_bulk_soft_delete),
    path("api/students/bulk-recover/", students_api.students_bulk_recover),
    path("api/students/deleted/", students_api.students_list_deleted),

    path("api/students/<uuid:student_id>/actions/", students_api.actions_list_by_student),
    path("api/students/<uuid:student_id>/actions/new/", students_api.actions_create),
    path("api/actions/<uuid:action_id>/update/", students_api.actions_update),
    path("api/actions/<uuid:action_id>/delete/", students_api.actions_delete),

    path("api/actions/", students_api.actions_list),
    path("api/actions/new/", students_api.actions_create_global),
    path("api/actions/bulk-delete/", students_api.actions_bulk_delete),
]