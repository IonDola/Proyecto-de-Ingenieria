from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
import secrets
import string
from datetime import datetime

User = get_user_model()

def _get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

# LOGIN
@api_view(["POST"])
@permission_classes([AllowAny])
def login_api(request):
    """
    Permite iniciar sesión de dos formas:
    1) Usuario normal: username + password (ADMIN/DEV/lo que ya tengas)
    2) Visitante: visitor_code (en el campo username) + password

    Respuesta (igual que antes):
    { access, refresh, nombre, rol }
    """
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    if not username or not password:
        return Response({"error": "missing_credentials"}, status=status.HTTP_400_BAD_REQUEST)

    # 1) Autenticacion normal (NO rompe lo existente)
    user = authenticate(request, username=username, password=password)

    # 2) Si fallo, probamos como visitor_code
    if not user:
        code = username.strip().upper()
        try:
            visitor = User.objects.get(role="VISITOR", visitor_code=code)
        except User.DoesNotExist:
            visitor = None

        if visitor and visitor.check_password(password):
            # Reglas de negocio de visitante
            if not visitor.is_active:
                return Response({"error": "visitor_inactive"}, status=status.HTTP_403_FORBIDDEN)
            if visitor.visitor_suspended_at:
                return Response({"error": "visitor_suspended"}, status=status.HTTP_403_FORBIDDEN)
            if visitor.visitor_expires_at and visitor.visitor_expires_at < timezone.localdate():
                return Response({"error": "visitor_expired"}, status=status.HTTP_403_FORBIDDEN)

            user = visitor  

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

# LOGOUT
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_api(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"error": "missing_refresh_token"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"ok": True}, status=status.HTTP_205_RESET_CONTENT)
    except TokenError:
        return Response({"error": "invalid_token"}, status=status.HTTP_400_BAD_REQUEST)


# visitantes
def _require_admin(user):
    return bool(user and user.is_authenticated and getattr(user, "role", "") == "ADMIN")

def _gen_code(length=5):
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))

def _unique_visitor_code():
    # intenta hasta encontrar uno que no exista
    for _ in range(20):
        code = _gen_code(5)
        if not User.objects.filter(visitor_code=code).exists():
            return code
    # muy improbable, como fallback alarga
    return _gen_code(6)

def _gen_password(length=10):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))

def _status_for(visitor):
    if visitor.visitor_suspended_at:
        return "Suspendida"
    if visitor.visitor_expires_at and visitor.visitor_expires_at < timezone.localdate():
        return "Vencida"
    return "Vigente"

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def visitors_list(request):
    if not _require_admin(request.user):
        return Response({"detail": "Acceso denegado"}, status=status.HTTP_403_FORBIDDEN)

    qs = User.objects.filter(role="VISITOR").order_by("-date_joined")
    results = []
    for u in qs:
        results.append({
            "id": u.id,
            "visitor_code": u.visitor_code,
            "expires_at": u.visitor_expires_at,
            "name": (u.get_full_name() or u.username),
            "status": _status_for(u),
        })
    return Response({"results": results}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def visitors_create(request):
    if not _require_admin(request.user):
        return Response({"detail": "Acceso denegado"}, status=status.HTTP_403_FORBIDDEN)

    name = (request.data.get("name") or "").strip()
    expires_at = (request.data.get("expires_at") or "").strip()
    if not name or not expires_at:
        return Response({"error": "name_and_expires_required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        exp_date = datetime.strptime(expires_at, "%Y-%m-%d").date()
    except ValueError:
        return Response({"error": "invalid_date"}, status=status.HTTP_400_BAD_REQUEST)

    code = _unique_visitor_code()
    password = _gen_password()
    username = f"VIS-{code}"

    u = User.objects.create(
        username=username,
        first_name=name,
        role="VISITOR",
        is_active=True,
        visitor_code=code,
        visitor_expires_at=exp_date,
        created_by=request.user
    )
    u.set_password(password)
    u.save()

    return Response({
        "id": u.id,
        "visitor_code": code,
        "password": password,
        "name": name,
        "expires_at": exp_date
    }, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def visitors_suspend(request, user_id: int):
    if not _require_admin(request.user):
        return Response({"detail": "Acceso denegado"}, status=status.HTTP_403_FORBIDDEN)

    try:
        u = User.objects.get(id=user_id, role="VISITOR")
    except User.DoesNotExist:
        return Response({"error": "not_found"}, status=status.HTTP_404_NOT_FOUND)

    u.visitor_suspended_at = timezone.now()
    u.is_active = False
    u.save(update_fields=["visitor_suspended_at", "is_active"])
    return Response({"ok": True}, status=status.HTTP_200_OK)
