# backend/students/api.py
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.db.models import Q
import json
from .models import Student, Action

def serialize_student(s):
    return {
        "id": str(s.id),
        "id_mep": s.id_mep,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "section": s.section,
        "active": s.active,
        "created_at": s.created_at.isoformat(),
        "updated_at": s.updated_at.isoformat(),
    }

def serialize_action(a):
    return {
        "id": str(a.id),
        "student_id": str(a.student_id),
        "type": a.type,
        "notes": a.notes,
        "actor": a.actor,
        "created_at": a.created_at.isoformat(),
    }

@require_http_methods(["GET"])
def students_list(request):
    q = request.GET.get("q", "").strip()
    qs = Student.objects.all()
    if q:
        qs = qs.filter(Q(id_mep__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q))
    return JsonResponse({"results": [serialize_student(s) for s in qs[:200]]})

@csrf_exempt
@require_http_methods(["POST"])
def students_create(request):
    data = json.loads(request.body or "{}")
    s = Student(
        id_mep=data.get("id_mep","").strip(),
        first_name=data.get("first_name","").strip(),
        last_name=data.get("last_name","").strip(),
        section=data.get("section","").strip(),
        active=bool(data.get("active", True)),
    )
    try:
        s.full_clean()
        s.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(serialize_student(s), status=201)

@require_http_methods(["GET"])
def students_detail(request, student_id):
    try:
        s = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    return JsonResponse(serialize_student(s))

@csrf_exempt
@require_http_methods(["PATCH","PUT"])
def students_update(request, student_id):
    try:
        s = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    data = json.loads(request.body or "{}")
    for f in ["id_mep","first_name","last_name","section","active"]:
        if f in data: setattr(s, f, data[f])
    try:
        s.full_clean()
        s.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(serialize_student(s))

@require_http_methods(["GET"])
def student_history(request, student_id):
    try:
        s = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    actions = s.actions.all().order_by("-created_at")[:200]
    return JsonResponse({"student": serialize_student(s), "actions": [serialize_action(a) for a in actions]})

@require_http_methods(["GET"])
def action_detail(request, action_id):
    try:
        a = Action.objects.get(pk=action_id)
    except Action.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    return JsonResponse(serialize_action(a))
