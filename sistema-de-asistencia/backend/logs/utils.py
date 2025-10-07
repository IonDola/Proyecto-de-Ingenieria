from .models import PersonalLog

def log_event(user, *, action, type, entity="", status="success", metadata=None):
    if user and getattr(user, "is_authenticated", False):
        PersonalLog.objects.create(
            user=user,
            action=action,
            type=type,
            entity=entity or "",
            status=status,
            metadata=metadata or {},
        )
