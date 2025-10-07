from django.urls import path
from .views import my_actions, my_action_detail

urlpatterns = [
    path("users/me/actions/", my_actions, name="my_actions"),
    path("users/me/actions/<uuid:pk>/", my_action_detail, name="my_action_detail"),
]
