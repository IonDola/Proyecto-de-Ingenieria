from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import PersonalLog
from .serializers import PersonalLogSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_actions(request):
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
    try:
        row = PersonalLog.objects.get(pk=pk, user=request.user)
    except PersonalLog.DoesNotExist:
        return Response({"error": "not_found"}, status=404)
    return Response(PersonalLogSerializer(row).data)
