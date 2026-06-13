import json
from pathlib import Path

from extractor.models import ClinicalNote, MedicalDocument

from agent.app.plan_service import PlanService, derive_patient_context
from agent.domain.models.actions import (
    Action,
    ActionPlan,
    ActionType,
    Priority,
)
from agent.domain.models.patient import PatientInput
from agent.domain.ports.planner import PlannerPort


FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "urologie_case.json"


def _load_fixture() -> tuple[list[MedicalDocument], ClinicalNote]:
    raw = json.loads(FIXTURE_PATH.read_text())
    documents = [MedicalDocument.model_validate(d) for d in raw["documents"]]
    clinical_note = ClinicalNote.model_validate(raw["clinical_note"])
    return documents, clinical_note


class FakePlanner(PlannerPort):
    def __init__(self) -> None:
        self.received: PatientInput | None = None

    def plan(self, patient_input: PatientInput) -> ActionPlan:
        self.received = patient_input
        return ActionPlan(
            actions=[
                Action(
                    id="a1",
                    type=ActionType.BOOK_LAB,
                    title="ECBU",
                    why="Required D-7 before ureteroscopy",
                    priority=Priority.HIGH,
                )
            ],
            alerts=["Lithium interaction to confirm with urologist"],
        )


def test_derive_patient_context_from_fixture() -> None:
    documents, clinical_note = _load_fixture()

    context = derive_patient_context(documents, clinical_note)

    assert context.name == "Marie Dupont"
    assert "Dr. Petit" in context.doctors
    # Only one doctor appears in this fixture despite being referenced multiple times.
    assert context.doctors.count("Dr. Petit") == 1
    assert context.known_treatments == []
    assert context.address is None
    assert context.notes is not None
    assert "lithium" in context.notes.lower()


def test_plan_from_raw_wires_context_and_delegates_to_planner() -> None:
    documents, clinical_note = _load_fixture()
    fake = FakePlanner()
    service = PlanService(fake)

    plan = service.plan_from_raw(documents, clinical_note)

    assert fake.received is not None
    assert fake.received.patient_context.name == "Marie Dupont"
    assert fake.received.documents == documents
    assert fake.received.clinical_note == clinical_note
    assert len(plan.actions) == 1
    assert plan.actions[0].type == ActionType.BOOK_LAB
