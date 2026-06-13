import uuid
from datetime import datetime, timedelta
from typing import List

from ..domain.models.timeline import TimelineItem, TimelineDay, TimelineItemType, TimelineStatus
from ..domain.models.vault import ActionStatus, DoseStatus, EventType
from ..domain.ports.repository import PatientRepository

class TimelineService:
    def __init__(self, repository: PatientRepository) -> None:
        self._repository = repository

    def generate_timeline(self, patient_id: str) -> List[TimelineDay]:
        history = self._repository.get_history(patient_id)
        
        items: List[TimelineItem] = []
        
        # Base date is the most recent consultation, or today if none
        base_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        if history.consultations:
            # Sort by date descending, take the first
            latest_consult = sorted(history.consultations, key=lambda c: c.date, reverse=True)[0]
            base_date = latest_consult.date.replace(hour=0, minute=0, second=0, microsecond=0)

        # 1. Medications
        for schedule in history.medication_schedules:
            for dose in schedule.doses:
                if dose.status == DoseStatus.TAKEN:
                    status = TimelineStatus.COMPLETED
                elif dose.status == DoseStatus.SKIPPED:
                    status = TimelineStatus.MISSED
                else:
                    if dose.scheduled_time < datetime.utcnow():
                        status = TimelineStatus.MISSED
                    else:
                        status = TimelineStatus.PENDING

                items.append(TimelineItem(
                    id=dose.id,
                    date=dose.scheduled_time,
                    type=TimelineItemType.MEDICATION,
                    title=schedule.medication_name,
                    description=f"{schedule.dosage or ''} {schedule.frequency or ''}".strip() or None,
                    status=status
                ))

        # 2. Tracked Actions (Tests, Appointments, Follow-ups)
        for plan in history.action_plans:
            for tracked in plan.tracked_actions:
                action = tracked.action
                
                # Map action type
                if action.type in ["BOOK_LAB", "BOOK_IMAGING"]:
                    item_type = TimelineItemType.TEST
                elif action.type in ["BOOK_APPOINTMENT", "BOOK_TRANSPORT"]:
                    item_type = TimelineItemType.APPOINTMENT
                elif action.type == "ADD_REMINDER":
                    item_type = TimelineItemType.FOLLOW_UP
                else:
                    continue # Skip other types if any
                
                # Map status
                if tracked.status == ActionStatus.DONE:
                    status = TimelineStatus.COMPLETED
                elif tracked.status in [ActionStatus.FAILED, ActionStatus.SKIPPED, ActionStatus.OVERDUE]:
                    status = TimelineStatus.MISSED
                else:
                    status = TimelineStatus.PENDING
                
                item_date = base_date
                if action.deadline:
                    try:
                        item_date = datetime.fromisoformat(action.deadline.replace('Z', '+00:00'))
                    except ValueError:
                        pass

                items.append(TimelineItem(
                    id=action.id,
                    date=item_date,
                    type=item_type,
                    title=action.title,
                    description=action.why,
                    status=status
                ))

        # Group items
        day_0 = base_date
        day_3 = base_date + timedelta(days=3)
        day_7 = base_date + timedelta(days=7)
        day_14 = base_date + timedelta(days=14)

        def get_bucket(dt: datetime) -> str:
            if not dt:
                return "Upcoming Appointment"
            # handle timezone unaware difference
            diff = dt.replace(tzinfo=None) - day_0.replace(tzinfo=None)
            if diff.days <= 1:
                return "Today"
            elif diff.days <= 4:
                return "Day 3"
            elif diff.days <= 10:
                return "Day 7"
            elif diff.days <= 21:
                return "Day 14"
            else:
                return "Upcoming Appointment"

        buckets = {
            "Today": {"date": day_0, "items": []},
            "Day 3": {"date": day_3, "items": []},
            "Day 7": {"date": day_7, "items": []},
            "Day 14": {"date": day_14, "items": []},
            "Upcoming Appointment": {"date": None, "items": []}
        }

        for item in sorted(items, key=lambda x: x.date.replace(tzinfo=None)):
            bucket_label = get_bucket(item.date)
            if item.type == TimelineItemType.APPOINTMENT and bucket_label not in ["Today", "Day 3"]:
                bucket_label = "Upcoming Appointment"
            buckets[bucket_label]["items"].append(item)

        timeline_days = []
        for label in ["Today", "Day 3", "Day 7", "Day 14", "Upcoming Appointment"]:
            b = buckets[label]
            if b["items"] or label == "Today":
                timeline_days.append(TimelineDay(
                    label=label,
                    date=b["date"],
                    items=b["items"]
                ))

        return timeline_days
