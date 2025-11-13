from django.urls import path
from .api import (
    login_api, logout_api,
    visitors_list, visitors_create, visitors_suspend,
    my_profile_info, update_my_profile_info
)

urlpatterns = [
    path("login/",  login_api,  name="login"),
    path("logout/", logout_api, name="logout"),
    path("my-profile/", my_profile_info, name="my-info"),
    path("my-profile/update/", update_my_profile_info, name="update-my-info"),

    path("visitors/",                    visitors_list,    name="visitors-list"),
    path("visitors/create/",             visitors_create,  name="visitors-create"),
    path("visitors/<int:user_id>/suspend/", visitors_suspend, name="visitors-suspend"),
]
