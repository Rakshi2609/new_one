from datetime import date

from ..domain.models.actions import Action
from ..domain.models.vault import ActionStatus
from ..domain.ports.repository import PatientRepository


class FollowupService:
    """Reads the vault to surface pending and overdue actions."""

    def __init__(self, repository: PatientRepository) -> None:
        self._repository = repository

    def pending_and_overdue(self, patient_id: str) -> dict[str, list[Action]]:
        history = self._repository.get_history(patient_id)
        today = date.today()

        pending: list[Action] = []
        overdue: list[Action] = []

        for stored_plan in history.action_plans:
            for tracked in stored_plan.tracked_actions:
                if tracked.status not in (ActionStatus.PENDING, ActionStatus.OVERDUE):
                    continue
                if _is_overdue(tracked.action, today):
                    overdue.append(tracked.action)
                else:
                    pending.append(tracked.action)

        return {"pending": pending, "overdue": overdue}


def _is_overdue(action: Action, today: date) -> bool:
    if not action.deadline:
        return False
    try:
        deadline = date.fromisoformat(action.deadline)
    except ValueError:
        return False
    return deadline < today
