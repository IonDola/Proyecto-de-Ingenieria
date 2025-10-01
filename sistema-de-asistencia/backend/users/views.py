from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import logout

@api_view(["POST"])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "nombre": user.get_full_name() or user.username,
            "rol": user.role  # <- viene de tu modelo CustomUser
        })
    return Response({"error": "Credenciales inválidas"}, status=401)

@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"message": "Sesión cerrada correctamente"})