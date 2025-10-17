from django.urls import path
from .api import login_api, logout_api

urlpatterns = [
    path("login/", login_api, name="login"),
    path("logout/", logout_api, name="logout"),

]
