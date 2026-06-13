from abc import ABC, abstractmethod

from ..models.actions import Action
from ..models.vault import (
    ActionStatus,
    Consultation,
    PatientCard,
    PatientHistory,
    StoredActionPlan,
)


class PatientRepository(ABC):
    """Port for persistent patient history."""

    @abstractmethod
    def get_history(self, patient_id: str) -> PatientHistory:
        return self._load(patient_id)

    def save_history(self, history: PatientHistory) -> None:
        self._save(history)

    @abstractmethod
    def save_consultation(
        self, patient_id: str, consultation: Consultation
    ) -> None: ...

    @abstractmethod
    def save_action_plan(
        self, patient_id: str, stored_plan: StoredActionPlan
    ) -> None: ...

    @abstractmethod
    def update_action_status(
        self,
        patient_id: str,
        plan_id: str,
        action_id: str,
        status: ActionStatus,
        result: dict | None = None,
    ) -> None: ...

    @abstractmethod
    def update_patient_card(self, patient_id: str, card: PatientCard) -> None: ...

    @abstractmethod
    def get_patient_card(self, patient_id: str) -> PatientCard: ...

    @abstractmethod
    def list_pending_actions(self, patient_id: str) -> list[Action]: ...
