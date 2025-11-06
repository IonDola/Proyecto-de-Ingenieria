from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from datetime import datetime
from .models import PersonalLog
from .serializers import PersonalLogSerializer


def _is_admin_or_dev(user):
    """Helper para verificar si el usuario es Admin o Dev"""
    return bool(
        user and 
        user.is_authenticated and 
        getattr(user, "role", "").upper() in ["ADMIN", "DEV"]
    )


# ========== BITÁCORA PERSONAL ==========

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_actions(request):
    """
    Bitácora personal del usuario autenticado.
    Query params:
    - q: búsqueda por texto
    - page_size: tamaño de página (default 20)
    """
    q = (request.GET.get("q") or "").strip()
    qs = PersonalLog.objects.filter(user=request.user).order_by("-timestamp")
    if q:
        qs = qs.filter(
            Q(action__icontains=q) |
            Q(type__icontains=q) |
            Q(entity__icontains=q) |
            Q(status__icontains=q)
        )
    paginator = PageNumberPagination()
    paginator.page_size = int(request.GET.get("page_size") or 20)
    page = paginator.paginate_queryset(qs, request)
    ser = PersonalLogSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_action_detail(request, pk):
    """
    Detalle de una acción específica de la bitácora personal.
    """
    try:
        row = PersonalLog.objects.get(pk=pk, user=request.user)
    except PersonalLog.DoesNotExist:
        return Response({"error": "not_found"}, status=404)
    return Response(PersonalLogSerializer(row).data)


# ========== BITÁCORA GENERAL (F-054) ==========

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_logs_list(request):
    """
    F-054: Bitácora general (solo Admin/Dev)
    
    Endpoint que lista TODOS los eventos del sistema con búsqueda y filtros.
    
    Query params:
    - q: búsqueda por texto (action, type, entity, status, username)
    - date_from: fecha inicio (YYYY-MM-DD)
    - date_to: fecha fin (YYYY-MM-DD)
    - action: filtrar por acción específica (LOGIN, LOGOUT, etc)
    - type: filtrar por tipo (auth, visitor_auth, create, update, etc)
    - user_id: filtrar por ID de usuario
    - page_size: tamaño de página (default 20, max 100)
    """
    # Verificar permisos
    if not _is_admin_or_dev(request.user):
        return Response(
            {"error": "forbidden", "detail": "Solo Admin/Dev pueden acceder a la bitácora general"},
            status=403
        )
    
    # Query base: todos los logs ordenados por más reciente
    qs = PersonalLog.objects.select_related("user").all().order_by("-timestamp")
    
    # Filtro de búsqueda general
    q = (request.GET.get("q") or "").strip()
    if q:
        qs = qs.filter(
            Q(action__icontains=q) |
            Q(type__icontains=q) |
            Q(entity__icontains=q) |
            Q(status__icontains=q) |
            Q(user__username__icontains=q) |
            Q(user__first_name__icontains=q) |
            Q(user__last_name__icontains=q)
        )
    
    # Filtro por rango de fechas
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")
    
    if date_from:
        try:
            dt_from = datetime.strptime(date_from, "%Y-%m-%d")
            qs = qs.filter(timestamp__gte=dt_from)
        except ValueError:
            return Response({"error": "invalid_date_from"}, status=400)
    
    if date_to:
        try:
            # Incluir todo el día especificado
            dt_to = datetime.strptime(date_to, "%Y-%m-%d")
            from datetime import timedelta
            dt_to_end = dt_to + timedelta(days=1)
            qs = qs.filter(timestamp__lt=dt_to_end)
        except ValueError:
            return Response({"error": "invalid_date_to"}, status=400)
    
    # Filtro por acción específica
    action_filter = request.GET.get("action")
    if action_filter:
        qs = qs.filter(action__iexact=action_filter)
    
    # Filtro por tipo
    type_filter = request.GET.get("type")
    if type_filter:
        qs = qs.filter(type__iexact=type_filter)
    
    # Filtro por usuario
    user_id_filter = request.GET.get("user_id")
    if user_id_filter:
        qs = qs.filter(user_id=user_id_filter)
    
    # Paginación
    paginator = PageNumberPagination()
    page_size = min(int(request.GET.get("page_size") or 20), 100)
    paginator.page_size = page_size
    
    page = paginator.paginate_queryset(qs, request)
    
    # Serializar con información del usuario
    results = []
    for log in page:
        data = PersonalLogSerializer(log).data
        # Agregar info del usuario
        data["user"] = {
            "id": log.user.id,
            "username": log.user.username,
            "full_name": log.user.get_full_name() or log.user.username,
            "role": getattr(log.user, "role", ""),
        }
        results.append(data)
    
    return paginator.get_paginated_response(results)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_logs_detail(request, pk):
    """
    F-054: Detalle de un evento específico de la bitácora general (solo Admin/Dev)
    """
    # Verificar permisos
    if not _is_admin_or_dev(request.user):
        return Response(
            {"error": "forbidden", "detail": "Solo Admin/Dev pueden acceder a la bitácora general"},
            status=403
        )
    
    try:
        log = PersonalLog.objects.select_related("user").get(pk=pk)
    except PersonalLog.DoesNotExist:
        return Response({"error": "not_found"}, status=404)
    
    # Serializar con información completa del usuario
    data = PersonalLogSerializer(log).data
    data["user"] = {
        "id": log.user.id,
        "username": log.user.username,
        "full_name": log.user.get_full_name() or log.user.username,
        "email": log.user.email,
        "role": getattr(log.user, "role", ""),
        "is_active": log.user.is_active,
    }
    
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_logs_stats(request):
    """
    Estadísticas de la bitácora general (para dashboard)
    
    Retorna:
    - Total de eventos
    - Eventos por tipo
    - Eventos recientes (últimas 24h)
    - Usuarios más activos
    """
    if not _is_admin_or_dev(request.user):
        return Response(
            {"error": "forbidden", "detail": "Solo Admin/Dev pueden acceder a las estadísticas"},
            status=403
        )
    
    from datetime import timedelta
    from django.utils import timezone
    from django.db.models import Count
    
    # Total de eventos
    total = PersonalLog.objects.count()
    
    # Eventos por tipo
    by_type = PersonalLog.objects.values("type").annotate(count=Count("id")).order_by("-count")
    
    # Eventos por acción
    by_action = PersonalLog.objects.values("action").annotate(count=Count("id")).order_by("-count")[:10]
    
    # Eventos en últimas 24h
    yesterday = timezone.now() - timedelta(days=1)
    recent_count = PersonalLog.objects.filter(timestamp__gte=yesterday).count()
    
    # Usuarios más activos (top 10)
    top_users = PersonalLog.objects.values(
        "user__id", "user__username", "user__first_name", "user__last_name"
    ).annotate(
        count=Count("id")
    ).order_by("-count")[:10]
    
    return Response({
        "total_events": total,
        "recent_24h": recent_count,
        "by_type": list(by_type),
        "by_action": list(by_action),
        "top_users": list(top_users),
    })