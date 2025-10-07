from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_ping(_request):
    return JsonResponse({"ok": True, "src": "django"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/ping/", api_ping),
    path('', include('students.urls')),
    path("api/users/", include("users.urls")),
    path("api/", include("logs.urls")),
]
