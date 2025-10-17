from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

User = get_user_model()

# --- Función auxiliar para generar tokens ---
def _get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

# --- LOGIN ---
@api_view(["POST"])
@permission_classes([AllowAny])
def login_api(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    if not username or not password:
        return Response({"error": "missing_credentials"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"error": "invalid_credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = _get_tokens_for_user(user)
    payload = {
        "access": tokens["access"],
        "refresh": tokens["refresh"],
        "nombre": user.get_full_name() or user.username,
        "rol": getattr(user, "role", "user"),
    }
    return Response(payload, status=status.HTTP_200_OK)

# --- LOGOUT ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_api(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"error": "missing_refresh_token"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # ← Invalida el token
        return Response({"ok": True}, status=status.HTTP_205_RESET_CONTENT)
    except TokenError:
        return Response({"error": "invalid_token"}, status=status.HTTP_400_BAD_REQUEST)
