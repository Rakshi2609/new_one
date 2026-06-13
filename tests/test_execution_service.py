import os
from pathlib import Path

from cryptography.fernet import Fernet

from agent.adapters.fernet_vault import FernetJsonVault
from agent.app.execution_service import ExecutionService
from agent.app.followup_service import FollowupService
from agent.domain.models.actions import (
    Action,
    ActionPlan,
    ActionType,
    Priority,
)
from agent.domain.models.execution import ActionDecision, Decision
from agent.domain.models.vault import ActionStatus


def _make_vault(tmp_path: Path) -> FernetJsonVault:
    # Force a deterministic Fernet key via env so tests don't depend on filesystem state.
    os.environ["VAULT_KEY"] = Fernet.generate_key().decode()
    return FernetJsonVault(vault_dir=tmp_path)


def _sample_plan() -> ActionPlan:
    return ActionPlan(
        actions=[
            Action(
                id="a1",
                type=ActionType.BOOK_LAB,
                title="Book ECBU",
                why="Pre-op",
                deadline="2099-01-15",
                priority=Priority.HIGH,
            ),
            Action(
                id="a2",
                type=ActionType.BOOK_LAB,
                title="Book creatinine test",
                why="Pre-op",
                deadline="2099-01-15",
                priority=Priority.HIGH,
                group_with="a1",
            ),
            Action(
                id="a3",
                type=ActionType.ADD_REMINDER,
                title="No heavy lifting",
                why="Post-op rest",
                deadline="2099-01-20",
                priority=Priority.MEDIUM,
            ),
            Action(
                id="a4",
                type=ActionType.BOOK_TRANSPORT,
                title="Taxi home",
                why="Reduced mobility",
                deadline="2099-01-18",
                priority=Priority.URGENT,
            ),
        ],
        patient_card_updates=[
            {"field": "upcoming_procedures", "value": "Ureteroscopy 2099-01-20"},
            {"field": "active_conditions", "value": "Kidney stones"},
        ],
    )


def test_execution_prepares_resources_and_keeps_actions_pending(tmp_path: Path) -> None:
    vault = _make_vault(tmp_path)
    # Seed the patient card with an address so Doctolib URLs pick up the ZIP.
    card = vault.get_patient_card("demo")
    card.address = "25 rue Tolbiac, 75013 Paris"
    vault.update_patient_card("demo", card)

    service = ExecutionService(vault)
    plan = _sample_plan()

    result = service.execute(
        patient_id="demo",
        documents=[],
        clinical_note=None,
        plan=plan,
        decisions=[],
    )

    executed = {e.action.id: e for e in result.executed_actions}

    # BOOK_LAB → Doctolib URL filled in, plus an .ics (because it has a deadline)
    assert "doctolib.fr" in executed["a1"].result["suggested_url"]
    assert "75013" in executed["a1"].result["suggested_url"]
    assert "BEGIN:VCALENDAR" in executed["a1"].result["ics"]

    # ADD_REMINDER → only .ics, no Doctolib URL
    assert "suggested_url" not in executed["a3"].result
    assert "BEGIN:VCALENDAR" in executed["a3"].result["ics"]

    # BOOK_TRANSPORT → Doctolib URL
    assert "doctolib.fr" in executed["a4"].result["suggested_url"]

    # All accepted actions remain PENDING — the patient hasn't completed them yet.
    assert all(e.status == ActionStatus.PENDING for e in result.executed_actions)

    # Patient card has been updated with plan_card_updates.
    assert "Ureteroscopy 2099-01-20" in result.updated_card.upcoming_procedures
    assert "Kidney stones" in result.updated_card.active_conditions


def test_reject_decision_marks_action_skipped(tmp_path: Path) -> None:
    vault = _make_vault(tmp_path)
    service = ExecutionService(vault)
    plan = _sample_plan()

    result = service.execute(
        patient_id="demo",
        documents=[],
        clinical_note=None,
        plan=plan,
        decisions=[ActionDecision(action_id="a4", decision=Decision.REJECT)],
    )

    a4 = next(e for e in result.executed_actions if e.action.id == "a4")
    assert a4.status == ActionStatus.SKIPPED
    assert a4.result["reason"] == "rejected by patient"


def test_modify_decision_applies_overrides(tmp_path: Path) -> None:
    vault = _make_vault(tmp_path)
    service = ExecutionService(vault)
    plan = _sample_plan()

    result = service.execute(
        patient_id="demo",
        documents=[],
        clinical_note=None,
        plan=plan,
        decisions=[
            ActionDecision(
                action_id="a3",
                decision=Decision.MODIFY,
                overrides={"title": "Restez allongée 24h"},
            )
        ],
    )

    a3 = next(e for e in result.executed_actions if e.action.id == "a3")
    assert a3.action.title == "Restez allongée 24h"
    assert a3.status == ActionStatus.PENDING


def test_followup_lists_pending_and_overdue(tmp_path: Path) -> None:
    vault = _make_vault(tmp_path)
    service = ExecutionService(vault)
    followup = FollowupService(vault)

    plan = ActionPlan(
        actions=[
            Action(
                id="future",
                type=ActionType.BOOK_LAB,
                title="Future lab",
                why="upcoming",
                deadline="2099-01-15",
                priority=Priority.HIGH,
            ),
            Action(
                id="past",
                type=ActionType.BOOK_LAB,
                title="Overdue lab",
                why="past",
                deadline="2000-01-01",
                priority=Priority.HIGH,
            ),
        ]
    )
    service.execute(
        patient_id="demo",
        documents=[],
        clinical_note=None,
        plan=plan,
        decisions=[],
    )

    buckets = followup.pending_and_overdue("demo")
    pending_ids = {a.id for a in buckets["pending"]}
    overdue_ids = {a.id for a in buckets["overdue"]}

    assert pending_ids == {"future"}
    assert overdue_ids == {"past"}


def test_plan_service_enriches_context_from_vault(tmp_path: Path) -> None:
    """Vault-backed known_treatments / address should land in the PatientContext."""
    from agent.app.plan_service import PlanService
    from agent.domain.models.actions import ActionPlan
    from agent.domain.models.patient import PatientInput
    from agent.domain.ports.planner import PlannerPort

    vault = _make_vault(tmp_path)
    card = vault.get_patient_card("demo")
    card.name = "Marie Dupont"
    card.address = "25 rue Tolbiac, 75013 Paris"
    card.current_treatments = ["Lithium 400mg"]
    card.regular_followups = ["Dr. Durand (psychiatre)"]
    vault.update_patient_card("demo", card)

    class CapturingPlanner(PlannerPort):
        def __init__(self) -> None:
            self.received: PatientInput | None = None

        def plan(self, patient_input: PatientInput) -> ActionPlan:
            self.received = patient_input
            return ActionPlan()

    planner = CapturingPlanner()
    service = PlanService(planner=planner, repository=vault)
    service.plan_from_raw([], None, patient_id="demo")

    ctx = planner.received.patient_context
    assert ctx.name == "Marie Dupont"
    assert ctx.address == "25 rue Tolbiac, 75013 Paris"
    assert "Lithium 400mg" in ctx.known_treatments
    assert "Dr. Durand (psychiatre)" in ctx.doctors
