from django.urls import path
from .api import (
    login_api, logout_api,
    visitors_list, visitors_create, visitors_suspend
)

urlpatterns = [
    path("login/",  login_api,  name="login"),
    path("logout/", logout_api, name="logout"),

    path("visitors/",                    visitors_list,    name="visitors-list"),
    path("visitors/create/",             visitors_create,  name="visitors-create"),
    path("visitors/<int:user_id>/suspend/", visitors_suspend, name="visitors-suspend"),
]
