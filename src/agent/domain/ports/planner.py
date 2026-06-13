from abc import ABC, abstractmethod

from ..models.actions import ActionPlan
from ..models.patient import PatientInput


class PlannerPort(ABC):
    """Port for a reasoning planner that turns PatientInput into an ActionPlan."""

    @abstractmethod
    def plan(self, patient_input: PatientInput) -> ActionPlan: ...
