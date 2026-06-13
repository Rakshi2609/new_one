import logging
import os
from datetime import datetime
from pathlib import Path

from cryptography.fernet import Fernet

from ..domain.models.actions import Action
from ..domain.models.vault import (
    ActionStatus,
    Consultation,
    DoseStatus,
    MedicationSchedule,
    PatientCard,
    PatientHistory,
    StoredActionPlan,
)
from ..domain.ports.repository import PatientRepository

logger = logging.getLogger(__name__)


class FernetJsonVault(PatientRepository):
    """
    Encrypted JSON vault, one file per patient.

    Key resolution:
      1. VAULT_KEY env var if set (base64 urlsafe Fernet key).
      2. Otherwise read/create `.vault_key` in the vault directory.
    """

    def __init__(self, vault_dir: Path | str = "vault") -> None:
        self._dir = Path(vault_dir)
        self._dir.mkdir(parents=True, exist_ok=True)
        self._fernet = Fernet(self._resolve_key())

    def _resolve_key(self) -> bytes:
        env_key = os.environ.get("VAULT_KEY")
        if env_key:
            return env_key.encode()

        key_file = self._dir / ".vault_key"
        if key_file.exists():
            return key_file.read_bytes()

        logger.warning(
            "No VAULT_KEY env var found — generating a new Fernet key in %s. "
            "Set VAULT_KEY in your .env to persist across environments.",
            key_file,
        )
        key = Fernet.generate_key()
        key_file.write_bytes(key)
        return key

    def _path(self, patient_id: str) -> Path:
        return self._dir / f"{patient_id}.json.enc"

    def _load(self, patient_id: str) -> PatientHistory:
        path = self._path(patient_id)
        if not path.exists():
            return PatientHistory(patient_id=patient_id)
        encrypted = path.read_bytes()
        plaintext = self._fernet.decrypt(encrypted)
        return PatientHistory.model_validate_json(plaintext)

    def _save(self, history: PatientHistory) -> None:
        plaintext = history.model_dump_json().encode()
        encrypted = self._fernet.encrypt(plaintext)
        self._path(history.patient_id).write_bytes(encrypted)

    def get_history(self, patient_id: str) -> PatientHistory:
        return self._load(patient_id)

    def save_history(self, history: PatientHistory) -> None:
        self._save(history)

    def save_consultation(self, patient_id: str, consultation: Consultation) -> None:
        history = self._load(patient_id)
        history.consultations.append(consultation)
        self._save(history)

    def save_action_plan(self, patient_id: str, stored_plan: StoredActionPlan) -> None:
        history = self._load(patient_id)
        history.action_plans.append(stored_plan)
        self._save(history)

    def update_action_status(
        self,
        patient_id: str,
        plan_id: str,
        action_id: str,
        status: ActionStatus,
        result: dict | None = None,
    ) -> None:
        history = self._load(patient_id)
        for stored_plan in history.action_plans:
            if stored_plan.id != plan_id:
                continue
            for tracked in stored_plan.tracked_actions:
                if tracked.action.id == action_id:
                    tracked.status = status
                    tracked.executed_at = datetime.utcnow()
                    if result is not None:
                        tracked.result = result
                    self._save(history)
                    return
        raise ValueError(
            f"Action {action_id} not found in plan {plan_id} for patient {patient_id}"
        )

    def update_patient_card(self, patient_id: str, card: PatientCard) -> None:
        history = self._load(patient_id)
        card.last_updated = datetime.utcnow()
        history.patient_card = card
        self._save(history)

    def get_patient_card(self, patient_id: str) -> PatientCard:
        return self._load(patient_id).patient_card

    def list_pending_actions(self, patient_id: str) -> list[Action]:
        history = self._load(patient_id)
        pending: list[Action] = []
        for stored_plan in history.action_plans:
            for tracked in stored_plan.tracked_actions:
                if tracked.status in (ActionStatus.PENDING, ActionStatus.OVERDUE):
                    pending.append(tracked.action)
        return pending

    def get_medication_schedules(self, patient_id: str) -> list[MedicationSchedule]:
        return self._load(patient_id).medication_schedules

    def add_medication_schedules(self, patient_id: str, new_schedules: list[MedicationSchedule]) -> None:
        history = self._load(patient_id)
        history.medication_schedules.extend(new_schedules)
        self._save(history)

    def update_dose_status(self, patient_id: str, schedule_id: str, dose_id: str, status: DoseStatus) -> None:
        history = self._load(patient_id)
        for sched in history.medication_schedules:
            if sched.id == schedule_id:
                for dose in sched.doses:
                    if dose.id == dose_id:
                        dose.status = status
                        dose.taken_at = datetime.utcnow() if status == DoseStatus.TAKEN else None
                        self._save(history)
                        return
        raise ValueError(f"Dose {dose_id} not found in schedule {schedule_id}")
