from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.db.models import Q
import json
from .models import Student, Action
from logs.utils import log_event

def serialize_student(s):
    return {
        "id": str(s.id),
        "id_mep": s.id_mep,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "section": s.section,
        "address": s.address,
        "birth_day": s.birth_date,
        "gender": s.gender,
        "nationality": s.nationality,
        "legal_guardian_1": s.guardian_name_1,
        "legal_guardian_id_1": s.guardian_id_1,
        "legal_guardian_phone_1": s.guardian_phone_1,
        "legal_guardian_2": s.guardian_name_2,
        "legal_guardian_id_2": s.guardian_id_2,
        "legal_guardian_phone_2": s.guardian_phone_2,
        "legal_guardian_3": s.guardian_name_3,
        "legal_guardian_id_3": s.guardian_id_3,
        "legal_guardian_phone_3": s.guardian_phone_3,
        "active": s.active,
        "created_at": s.created_at.isoformat(),
        "updated_at": s.updated_at.isoformat(),
    }

def serialize_student_resumed(s):
    return {
        "id": str(s.id),
        "id_mep": s.id_mep,
        "first_name": s.first_name,
        "last_name": s.last_name,
    }
def serialize_action(a):
    return {
        "id": str(a.id),
        "student_id": str(a.student_id),
        "type": a.type,
        "on_revision": a.on_revision,
        "origin_school": a.origin_school,
        "transferred": a.transferred,
        "notes": a.notes,
        "actor": a.actor,
        "created_at": a.created_at.isoformat(),
    }

def serialize_action_resumed(a):
    return {
        "id": str(a.id),
        "student_id": str(a.student_id),
        "type": a.type,
        "on_revision": a.on_revision,
    }


@require_http_methods(["GET"])
def students_list(request):
    q = request.GET.get("q", "").strip()
    qs = Student.objects.exclude(active=False)
    if q:
        qs = qs.filter(Q(id_mep__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q))
    return JsonResponse({"results": [serialize_student_resumed(s) for s in qs[:200]]})

@csrf_exempt
@require_http_methods(["POST"])
def students_create(request):
    data = json.loads(request.body)
    s = Student(
        id_mep=data.get("id_mep","").strip(),
        first_name=data.get("first_name","").strip(),
        last_name=data.get("last_name","").strip(),
        nationality=data.get("nationality", "").strip(),
        birth_date=data.get("birth_date", "").strip(),
        gender=data.get("gender", "").strip(),
        section=data.get("section","").strip(),
        address=data.get("address", "").strip(),
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


@csrf_exempt
@require_http_methods(["POST"])
def actions_create(request, student_id):
    """Crea una acción para un estudiante."""
    log_event(
        request.user,
        action="Registrar acción",
        type="create",
        entity=f"Estudiante: {s.first_name} {s.last_name} ({s.id_mep})",
        status="success",
        metadata={"action_id": str(a.id), "action_type": a.type, "student_id": str(s.id)},
    )
    try:
        s = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    a = Action(
        student=s,
        type=(data.get("type") or "").strip().lower(),
        notes=(data.get("notes") or "").strip(),
        actor=(getattr(request.user, "username", "") if getattr(request, "user", None) and request.user.is_authenticated else (data.get("actor") or "").strip()),
    )
    try:
        a.full_clean()
        a.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(serialize_action(a), status=201)


@csrf_exempt
@require_http_methods(["PATCH", "PUT"])
def actions_update(request, action_id):
    """Actualiza una acción (tipo / notas / actor)."""
    
    log_event(
        request.user,
        action="Editar acción",
        type="update",
        entity=f"Acción {a.id} de estudiante {a.student.id_mep}",
        status="success",
        metadata={"action_id": str(a.id), "student_id": str(a.student_id)},
    )

    try:
        a = Action.objects.get(pk=action_id)
    except Action.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    for f in ["type", "notes", "actor"]:
        if f in data:
            val = (data[f] or "")
            if f == "type":
                val = val.strip().lower()
            setattr(a, f, val)
    try:
        a.full_clean()
        a.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(serialize_action(a))


@csrf_exempt
@require_http_methods(["DELETE"])
def actions_delete(request, action_id):
    """Elimina una accion"""

    log_event(
        request.user,
        action="Eliminar acción",
        type="delete",
        entity=f"Acción {action_id} de estudiante",
        status="success",
        metadata={"deleted_id": action_id},
    )

    try:
        a = Action.objects.get(pk=action_id)
    except Action.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    a.delete()
    return JsonResponse({"ok": True})


@require_http_methods(["GET"])
def actions_list_by_student(request, student_id):
    """Lista acciones (paginacion ligera opcional via ?limit= & ?type=)."""
    try:
        s = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)

    qs = s.actions.all().order_by("-created_at")
    type_q = (request.GET.get("type") or "").strip().lower()
    if type_q:
        qs = qs.filter(type=type_q)

    limit = min(int(request.GET.get("limit", 200)), 500)
    return JsonResponse({"results": [serialize_action(a) for a in qs[:limit]]})


@require_http_methods(["GET"])
def actions_list(request):
    """
    Lista acciones de todos los estudiantes.
    Filtros:
      ?q=...  (id_mep, first_name, last_name, actor, notes)
      ?type=ingreso|egreso|abandono|transferencia
      ?limit=200
    """
    q = (request.GET.get("q") or "").strip().lower()
    type_q = (request.GET.get("type") or "").strip().lower()
    qs = Action.objects.select_related("student").all().order_by("-created_at")
    if type_q:
        qs = qs.filter(type=type_q)
    if q:
        from django.db.models import Q
        qs = qs.filter(
            Q(student__id_mep__icontains=q) |
            Q(student__first_name__icontains=q) |
            Q(student__last_name__icontains=q) |
            Q(actor__icontains=q) |
            Q(notes__icontains=q)
        )
    limit = min(int(request.GET.get("limit", 200)), 500)
    results = []
    for a in qs[:limit]:
        item = serialize_action(a)
        # enriquecemos con datos del estudiante (para la tabla)
        item["student"] = {
            "id": str(a.student_id),
            "id_mep": a.student.id_mep,
            "first_name": a.student.first_name,
            "last_name": a.student.last_name,
        }
        results.append(item)
    return JsonResponse({"results": results})


@csrf_exempt
@require_http_methods(["POST"])
def actions_create_global(request):
    """
    Crea una acción indicando student_id en el body.
    Body: { "student_id": "<uuid>", "type": "...", "notes": "..." }
    """
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    sid = (data.get("student_id") or "").strip()
    if not sid:
        return JsonResponse({"error": "student_id_required"}, status=400)
    try:
        s = Student.objects.get(pk=sid)
    except Student.DoesNotExist:
        return JsonResponse({"error": "student_not_found"}, status=404)

    a = Action(
        student=s,
        type=(data.get("type") or "").strip().lower(),
        notes=(data.get("notes") or "").strip(),
        actor=(getattr(request.user, "username", "") if getattr(request, "user", None) and request.user.is_authenticated else (data.get("actor") or "").strip()),
    )
    try:
        a.full_clean()
        a.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(serialize_action(a), status=201)


@csrf_exempt
@require_http_methods(["POST"])
def actions_bulk_delete(request):
    """
    Borra varias acciones por IDs.
    Body: { "ids": ["uuid1","uuid2", ...] }
    """
    try:
        data = json.loads(request.body or "{}")
        ids = data.get("ids") or []
        if not isinstance(ids, list) or not ids:
            return JsonResponse({"error": "ids_required"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    deleted, _ = Action.objects.filter(id__in=ids).delete()
    return JsonResponse({"ok": True, "deleted": deleted})

@csrf_exempt
@require_http_methods(["POST"])
def students_bulk_delete(request):
    """
    Borra varios estudiantes por IDs.
    Body: { "ids": ["uuid1","uuid2", ...] }
    Nota: eliminar un Student elimina también sus Action por FK CASCADE.
    """
    try:
        data = json.loads(request.body or "{}")
        ids = data.get("ids") or []
        if not isinstance(ids, list) or not ids:
            return JsonResponse({"error": "ids_required"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    deleted, _ = Student.objects.filter(id__in=ids).delete()
    return JsonResponse({"ok": True, "deleted": deleted})