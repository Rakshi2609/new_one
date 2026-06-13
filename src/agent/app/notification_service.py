import uuid
from datetime import datetime, timedelta
from typing import List

from ..domain.models.vault import (
    Notification,
    NotificationType,
    DoseStatus,
    ActionStatus
)
from ..domain.ports.repository import PatientRepository

class NotificationService:
    def __init__(self, repository: PatientRepository) -> None:
        self._repository = repository

    def get_notifications(self, patient_id: str) -> List[Notification]:
        self.generate_due_notifications(patient_id)
        history = self._repository.get_history(patient_id)
        return sorted(history.notifications, key=lambda n: n.created_at, reverse=True)

    def generate_due_notifications(self, patient_id: str) -> None:
        history = self._repository.get_history(patient_id)
        now = datetime.utcnow()
        changed = False

        existing_keys = set(f"{n.type}_{n.message}" for n in history.notifications)

        for schedule in history.medication_schedules:
            for dose in schedule.doses:
                if dose.status == DoseStatus.PENDING:
                    diff = dose.scheduled_time - now
                    if timedelta(minutes=-60) <= diff <= timedelta(minutes=15):
                        msg = f"Time to take your {schedule.medication_name} ({schedule.dosage})"
                        key = f"{NotificationType.MEDICATION}_{msg}"
                        if key not in existing_keys:
                            new_notif = Notification(
                                id=uuid.uuid4().hex,
                                title="Medication Reminder",
                                message=msg,
                                type=NotificationType.MEDICATION,
                                created_at=now
                            )
                            history.notifications.append(new_notif)
                            existing_keys.add(key)
                            changed = True

        for plan in history.action_plans:
            for tracked in plan.tracked_actions:
                if tracked.status == ActionStatus.PENDING and tracked.action.deadline:
                    try:
                        deadline = datetime.fromisoformat(tracked.action.deadline.replace('Z', '+00:00'))
                        diff = deadline.replace(tzinfo=None) - now
                        if timedelta(hours=-24) <= diff <= timedelta(hours=24):
                            msg = f"Upcoming: {tracked.action.title}"
                            ntype = NotificationType.APPOINTMENT if tracked.action.type in ["BOOK_APPOINTMENT", "BOOK_LAB", "BOOK_IMAGING"] else NotificationType.TASK
                            title = "Appointment Reminder" if ntype == NotificationType.APPOINTMENT else "Task Reminder"
                            key = f"{ntype}_{msg}"
                            if key not in existing_keys:
                                new_notif = Notification(
                                    id=uuid.uuid4().hex,
                                    title=title,
                                    message=msg,
                                    type=ntype,
                                    created_at=now
                                )
                                history.notifications.append(new_notif)
                                existing_keys.add(key)
                                changed = True
                    except ValueError:
                        pass

        if changed:
            self._repository.save_history(history)

    def mark_as_read(self, patient_id: str, notification_id: str) -> None:
        history = self._repository.get_history(patient_id)
        changed = False
        for n in history.notifications:
            if n.id == notification_id and not n.is_read:
                n.is_read = True
                changed = True
                
        if changed:
            self._repository.save_history(history)
