from django.db import ProgrammingError, OperationalError
from .models import PersonalLog

def log_event(user, *, action, type, entity="", status="success", metadata=None, ignore_db_errors=True):
    if not getattr(user, "is_authenticated", False):
        return
    try:
        PersonalLog.objects.create(
            user=user,
            action=action,
            type=type,
            entity=entity or "",
            status=status,
            metadata=metadata or {},
        )
    except (ProgrammingError, OperationalError):
        if not ignore_db_errors:
            raise
        return
