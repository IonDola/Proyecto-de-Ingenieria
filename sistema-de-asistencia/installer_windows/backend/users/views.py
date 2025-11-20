from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def _issue_access_token_for(user):
    access = RefreshToken.for_user(user).access_token
    return str(access)

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    if not username or not password:
        return Response({"error": "missing_credentials"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"error": "invalid_credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    token = _issue_access_token_for(user)
    payload = {
        "token": token,
        "nombre": user.get_full_name() or user.username,
        "rol": getattr(user, "role", "user"),
    }
    return Response(payload, status=status.HTTP_200_OK)

@api_view(["POST"])
def logout_view(request):
    return Response({"ok": True})
