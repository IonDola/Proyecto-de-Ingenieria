from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from .views import not_allowed
def api_ping(_request):
    return JsonResponse({"ok": True, "src": "django"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/ping/", api_ping),
    path('students/', include('students.urls')),
    path("api/users/", include("users.urls")),
    path("api/", include("logs.urls")),
    path("", not_allowed),
]
