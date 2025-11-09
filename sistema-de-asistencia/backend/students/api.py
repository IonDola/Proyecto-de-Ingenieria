from django.http import JsonResponse, HttpResponseNotAllowed, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.db.models import Q
import json
from .models import Student, Action
from logs.utils import log_event
from .pdf_utils import generate_student_history_pdf

def _debug_user_info(request, user, origin, extra=None):
    """
    Imprime info de atribución de usuario para depurar bitácora.
    - origin: cadena corta del endpoint/operación (p.ej. 'students_create')
    - extra: dict opcional con datos relevantes
    """
    try:
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        auth_short = (auth[:60] + "...") if auth and len(auth) > 60 else auth
        print("=== DEBUG LOG ATTRIBUTION ===")
        print(f"origin={origin}")
        print(f"request.user.is_authenticated={getattr(getattr(request,'user',None),'is_authenticated', False)}")
        print(f"Authorization header (short)={auth_short!r}")
        if user is None:
            print("resolved_user=None")
        else:
            print(f"resolved_user.id={getattr(user,'id',None)} username={getattr(user,'username',None)}")
        if extra:
            try:
                print("extra=", json.dumps(extra, ensure_ascii=False))
            except Exception:
                print("extra(raw)=", extra)
        print("=============================")
    except Exception as e:
        print("DEBUG ERROR:", e)

def _maybe_attach_debug_header(request, response, user, origin):
    """
    Si viene ?debug=1, agrega X-Debug-User con info básica.
    """
    try:
        if request.GET.get("debug") in ("1", "true", "yes", "on"):
            if user is None:
                response["X-Debug-User"] = f"{origin}: user=None"
            else:
                response["X-Debug-User"] = f"{origin}: user_id={getattr(user,'id',None)} username={getattr(user,'username',None)}"
    except Exception:
        pass
    return response

# Auth helper: intenta resolver el usuario autenticado desde JWT (o request.user)
def _get_request_user(request):
    try:
        # si ya viene autenticado por middleware/session, úsalo
        u = getattr(request, "user", None)
        if u is not None and getattr(u, "is_authenticated", False):
            return u
    except Exception:
        pass

    # Intentar con JWTAuthentication (lee Authorization: Bearer <access>)
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        authenticator = JWTAuthentication()
        auth = authenticator.authenticate(request)  # (user, token) o None
        if auth:
            return auth[0]
    except Exception:
        # no hacemos ruido: si no podemos autenticar, devolvemos None
        return None
    return None


def serialize_student(s):
    return {
        "id": str(s.id),
        "id_mep": s.id_mep,
        "first_name": s.first_name,
        "surnames": s.surnames,
        "section": s.section,
        "address": s.address,
        "birth_date": s.birth_date,
        "birth_place": s.birth_place,
        "ongoing_age": s.ongoing_age,
        "ongoing_age_year": s.ongoing_age_year,
        "gender": s.gender,
        "nationality": s.nationality,
        "guardian_name_1": s.guardian_name_1,
        "guardian_id_1": s.guardian_id_1,
        "guardian_phone_1": s.guardian_phone_1,
        "guardian_relationship_1": s.guardian_relationship_1,
        "guardian_name_2": s.guardian_name_2,
        "guardian_id_2": s.guardian_id_2,
        "guardian_phone_2": s.guardian_phone_2,
        "guardian_relationship_2": s.guardian_relationship_2,
        "guardian_name_3": s.guardian_name_3,
        "guardian_id_3": s.guardian_id_3,
        "guardian_phone_3": s.guardian_phone_3,
        "guardian_relationship_3": s.guardian_relationship_3,
        "institutional_guardian": s.institutional_guardian,
        "created_at": s.created_at.isoformat(),
        "updated_at": s.updated_at.isoformat(),
    }

def serialize_student_resumed(s):
    return {
        "id": str(s.id),
        "id_mep": s.id_mep,
        "first_name": s.first_name,
        "surnames": s.surnames,
    }

def serialize_action(a):
    return {
        "id": str(a.id),
        "student_id": str(a.student.id),
        "type": a.type,
        "on_revision": a.on_revision,
        "origin_school": a.origin_school,
        "transferred": a.transferred,
        "matriculate_level": a.matriculate_level,
        "notes": a.notes,
        "actor": a.actor,
        "last_edition_by": a.last_edition_by,
        "created_at": a.created_at.isoformat(),
    }

def serialize_action_resumed(a):
    return {
        "id": str(a.id),
        "type": a.type,
        "on_revision": a.on_revision,
        "created_at": a.created_at.isoformat(),
    }


@require_http_methods(["GET"])
def students_list(request):
    q = request.GET.get("q", "").strip()
    qs = Student.objects.all()

    if q:
        qs = qs.filter(Q(id_mep__icontains=q) | Q(first_name__icontains=q) | Q(surnames__icontains=q))
    return JsonResponse({"results": [serialize_student_resumed(s) for s in qs[:200]]})

@csrf_exempt
@require_http_methods(["POST"])
def students_create(request):
    data = json.loads(request.body)
    expected_fields = [
        "id_mep",
        "first_name",
        "surnames",
        "section",
        "address",
        "birth_date",
        "birth_place",
        "ongoing_age",
        "ongoing_age_year",
        "gender",
        "nationality",
        "guardian_name_1",
        "guardian_id_1",
        "guardian_phone_1",
        "guardian_relationship_1",
        "guardian_name_2",
        "guardian_id_2",
        "guardian_phone_2",
        "guardian_relationship_2",
        "guardian_name_3",
        "guardian_id_3",
        "guardian_phone_3",
        "guardian_relationship_3",
        "institutional_guardian",
    ]

    s = Student()
    for f in expected_fields:
        value = data.get(f, "").strip() if isinstance(data.get(f), str) else data.get(f)
        setattr(s, f, value)

    if isinstance(s.birth_date, str) and s.birth_date:
        from datetime import datetime
        try:
            s.birth_date = datetime.strptime(s.birth_date, "%Y-%m-%d").date()
        except ValueError:
            try:
                s.birth_date = datetime.strptime(s.birth_date, "%d/%m/%Y").date()
            except ValueError:
                return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY."}, status=400)

    try:
        s.full_clean()
        s.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    # Asegurar usuario autenticado para la bitácora
    user = _get_request_user(request)
    _debug_user_info(request, user, origin="students_create", extra={"student_id": str(s.id)})

    log_event(
        user,
        action="STUDENT_CREATED",
        type="create",
        entity=f"{s.first_name} {s.surnames} ({s.id_mep})",
        status="success",
        metadata={"student_id": str(s.id)},
    )

    resp = JsonResponse(serialize_student(s), status=201)
    return _maybe_attach_debug_header(request, resp, user, "students_create")

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
    updatable_fields = [
        "id_mep",
        "first_name",
        "surnames",
        "section",
        "address",
        "birth_date",
        "birth_place",
        "ongoing_age",
        "ongoing_age_year",
        "gender",
        "nationality",
        "guardian_name_1",
        "guardian_id_1",
        "guardian_phone_1",
        "guardian_relationship_1",
        "guardian_name_2",
        "guardian_id_2",
        "guardian_phone_2",
        "guardian_relationship_2",
        "guardian_name_3",
        "guardian_id_3",
        "guardian_phone_3",
        "guardian_relationship_3",
        "institutional_guardian",
    ]

    for f in updatable_fields:
        if f in data:
            setattr(s, f, data[f])
    try:
        s.full_clean()
        s.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    # Usuario para bitácora
    user = _get_request_user(request)
    _debug_user_info(request, user, origin="students_update", extra={"student_id": str(s.id)})

    log_event(
        user,
        action="STUDENT_UPDATED",
        type="update",
        entity=f"{s.first_name} {s.surnames} ({s.id_mep})",
        status="success",
        metadata={"student_id": str(s.id)},
    )

    resp = JsonResponse(serialize_student(s))
    return _maybe_attach_debug_header(request, resp, user, "students_update")

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
    try:
        s = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    # Resolver usuario/actor
    user = _get_request_user(request)
    actor = (user.username if user and getattr(user, "username", "") else
             (data.get("actor") or "").strip())

    a = Action(
        student=s,
        type=(data.get("type") or "").strip().lower(),
        notes=(data.get("notes") or "").strip(),
        actor=actor,
        origin_school=(data.get("origin_school") or None),
        transferred=bool(data.get("transferred")),
        matriculate_level=(data.get("matriculate_level" or "")),
        on_revision=True if data.get("on_revision") is None else bool(data.get("on_revision")),
        last_edition_by=(data.get("last_edition_by") or actor),
    )
    try:
        a.full_clean()
        a.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    _debug_user_info(request, user, origin="actions_create", extra={"student_id": str(s.id), "action_id": str(a.id)})

    log_event(
        user,  # ahora sí atribuimos al usuario autenticado
        action="ACTION_CREATED",
        type=a.type or "unknown",
        entity=f"Estudiante: {s.first_name} {s.surnames} ({s.id_mep})",
        status="success",
        metadata={"action_id": str(a.id), "student_id": str(s.id)},
    )

    resp = JsonResponse(serialize_action(a), status=201)
    return _maybe_attach_debug_header(request, resp, user, "actions_create")


@csrf_exempt
@require_http_methods(["PATCH", "PUT"])
def actions_update(request, action_id):
    """Actualiza una acción (tipo / notas / actor / on_revision / origin_school / transferred)."""
    try:
        a = Action.objects.get(pk=action_id)
    except Action.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid_json"}, status=400)

    for f in ["type", "notes", "actor", "on_revision", "origin_school", "matriculate_level", "transferred", "last_edition_by"]:
        if f in data:
            val = data[f]
            if f == "type":
                val = (val or "").strip().lower()
            if f == "matriculate_level":
                val = (val or "").strip().lower()
            if f == "on_revision":
                val = bool(val)
                print(val)
            if f == "transferred":
                val = bool(val)
            setattr(a, f, val)
    try:
        a.clean()
        a.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    # Usuario para bitácora
    user = _get_request_user(request)
    _debug_user_info(request, user, origin="actions_update", extra={"action_id": str(a.id), "student_id": str(a.student_id)})

    log_event(
        user,
        action="ACTION_UPDATED",
        type=a.type or "unknown",
        entity=f"Acción {a.id} de estudiante {a.student.id_mep}",
        status="success",
        metadata={"action_id": str(a.id), "student_id": str(a.student_id)},
    )

    resp = JsonResponse(serialize_action(a))
    return _maybe_attach_debug_header(request, resp, user, "actions_update")


@csrf_exempt
@require_http_methods(["DELETE"])
def actions_delete(request, action_id):
    """Elimina una accion"""
    try:
        a = Action.objects.get(pk=action_id)
    except Action.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)

    sid = str(a.student_id)
    sid_mep = a.student.id_mep
    atype = a.type or "unknown"

    a.delete()

    # Usuario para bitácora
    user = _get_request_user(request)
    _debug_user_info(request, user, origin="actions_delete", extra={"deleted_id": str(action_id), "student_id": sid})

    log_event(
        user,
        action="ACTION_DELETED",
        type=atype,
        entity=f"Acción {action_id} de estudiante {sid_mep}",
        status="success",
        metadata={"deleted_id": str(action_id), "student_id": sid},
    )

    resp = JsonResponse({"ok": True})
    return _maybe_attach_debug_header(request, resp, user, "actions_delete")


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
      ?q=...  (id_mep, first_name, surnames, actor, notes)
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
            Q(student__surnames__icontains=q) |
            Q(actor__icontains=q) |
            Q(notes__icontains=q)
        )
    limit = min(int(request.GET.get("limit", 200)), 500)
    results = []
    for a in qs[:limit]:
        item = serialize_action_resumed(a)
        item["student"] = {
            "id_mep": a.student.id_mep,
            "first_name": a.student.first_name,
            "surnames": a.student.surnames,
        }
        results.append(item)
    return JsonResponse({"results": results})


@csrf_exempt
@require_http_methods(["POST"])
def actions_create_global(request):
    """
    Crea una acción indicando student_id en el body.
    Body: { "student_id": "<uuid>", "type": "...", "notes": "...",
            "origin_school": "...", "transferred": true/false, "on_revision": true/false }
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

    # Resolver usuario/actor
    user = _get_request_user(request)
    actor = (user.username if user and getattr(user, "username", "") else
             (data.get("actor") or "").strip())

    a = Action(
        student=s,
        type=(data.get("type") or "").strip().lower(),
        notes=(data.get("notes") or "").strip(),
        actor=actor,
        # campos adicionales desde el body
        origin_school=(data.get("origin_school") or None),
        transferred=bool(data.get("transferred")),
        on_revision=True if data.get("on_revision") is None else bool(data.get("on_revision")),
    )
    try:
        a.full_clean()
        a.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    _debug_user_info(request, user, origin="actions_create_global", extra={"student_id": str(s.id), "action_id": str(a.id)})

    log_event(
        user,  # atribuimos al usuario autenticado
        action="ACTION_CREATED",
        type=a.type or "unknown",
        entity=f"Estudiante: {s.first_name} {s.surnames} ({s.id_mep})",
        status="success",
        metadata={"action_id": str(a.id), "student_id": str(s.id)},
    )

    resp = JsonResponse(serialize_action(a), status=201)
    return _maybe_attach_debug_header(request, resp, user, "actions_create_global")


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


# EXPORTACIÓN PDF

@require_http_methods(["GET"])
def export_student_pdf(request, student_id):
    """
    F-037: Exporta el historial de un estudiante en formato PDF.
    Endpoint: GET /api/students/<student_id>/export-pdf/
    """
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    
    # Obtener todas las acciones del estudiante ordenadas por fecha
    actions = student.actions.all().order_by("-created_at")
    
    # Usuario para bitácora
    user = _get_request_user(request)
    
    # Generar el PDF
    try:
        pdf_buffer = generate_student_history_pdf(student, actions)
        
        # Registrar la exportación en la bitácora
        log_event(
            user,
            action="STUDENT_PDF_EXPORTED",
            type="export",
            entity=f"Estudiante: {student.first_name} {student.surnames} ({student.id_mep})",
            status="success",
            metadata={"student_id": str(student.id), "action_count": len(actions)},
        )
        
        # Preparar la respuesta HTTP con el PDF
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f"Historial_{student.first_name}_{student.surnames}_{student.id_mep}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        log_event(
            user,
            action="STUDENT_PDF_EXPORT_FAILED",
            type="export",
            entity=f"Estudiante: {student.first_name} {student.surnames} ({student.id_mep})",
            status="failed",
            metadata={"student_id": str(student.id), "error": str(e)},
        )
        return JsonResponse({"error": f"Error generando PDF: {str(e)}"}, status=500)