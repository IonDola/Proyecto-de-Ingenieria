from django.urls import path

from .views import (
    my_actions, 
    my_action_detail,
    global_logs_list,
    global_logs_detail,
    global_logs_stats,
)

urlpatterns = [
    # bitacora personal
    path("users/me/actions/", my_actions, name="my-actions"),
    path("users/me/actions/<uuid:pk>/", my_action_detail, name="my-action-detail"),
    
    # F-054: bitacora general (Admin/Dev only)
    path("logs/", global_logs_list, name="global-logs-list"),
    path("logs/<uuid:pk>/", global_logs_detail, name="global-logs-detail"),
    path("logs/stats/", global_logs_stats, name="global-logs-stats"),
]