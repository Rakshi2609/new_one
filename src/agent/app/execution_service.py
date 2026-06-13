import uuid
from datetime import datetime

from extractor.models import ClinicalNote, MedicalDocument

from ..adapters.doctolib_links import build_doctolib_url
from ..adapters.ics_generator import build_ics_for_action
from ..domain.models.actions import Action, ActionPlan, ActionType
from ..domain.models.execution import (
    ActionDecision,
    Decision,
    ExecutedAction,
    ExecutionResult,
)
from ..domain.models.vault import (
    ActionStatus,
    Consultation,
    DoseStatus,
    MedicationSchedule,
    PatientCard,
    ScheduledDose,
    StoredActionPlan,
    TrackedAction,
)
from ..domain.ports.repository import PatientRepository

# Action types that map to a Doctolib search link.
_BOOKABLE_TYPES = {
    ActionType.BOOK_LAB,
    ActionType.BOOK_IMAGING,
    ActionType.BOOK_APPOINTMENT,
    ActionType.BOOK_TRANSPORT,
}


class ExecutionService:
    """
    Pass 2 — executes a validated plan and persists everything to the vault.

    Deterministic dispatch on Action.type (no Mistral calls here):
      - BOOK_* actions → Doctolib search URL in result["suggested_url"]
      - any action with a deadline → .ics content in result["ics"]
      - MODIFY → overrides merged into the Action before execution
      - REJECT → marked SKIPPED, no resources generated

    Semantics of the final status:
      - ACCEPTED actions are stored as PENDING with the prepared resources.
        "Done" means the patient has confirmed the real-world task is complete
        (future endpoint), not that the agent has prepared it. This keeps
        `pending_and_overdue` meaningful.
      - REJECTED actions are stored as SKIPPED.
    """

    def __init__(self, repository: PatientRepository) -> None:
        self._repository = repository

    def execute(
        self,
        patient_id: str,
        documents: list[MedicalDocument],
        clinical_note: ClinicalNote | None,
        plan: ActionPlan,
        decisions: list[ActionDecision],
    ) -> ExecutionResult:
        now = datetime.utcnow()

        # 1. Persist the consultation.
        consultation = Consultation(
            id=uuid.uuid4().hex,
            date=now,
            practitioner=clinical_note.practitioner if clinical_note else None,
            documents=documents,
            clinical_note=clinical_note,
        )
        self._repository.save_consultation(patient_id, consultation)

        # 1.5. Extract medications into MedicationSchedules
        new_schedules: list[MedicationSchedule] = []
        for doc in documents:
            for med in doc.medications:
                # Generate a simple 7-day schedule, 1 dose per day for demo
                doses = [
                    ScheduledDose(id=uuid.uuid4().hex, scheduled_time=now)
                ]
                new_schedules.append(
                    MedicationSchedule(
                        id=uuid.uuid4().hex,
                        medication_name=med.name,
                        dosage=med.dosage,
                        frequency=med.frequency,
                        instructions=med.instructions,
                        doses=doses,
                    )
                )
        if new_schedules:
            self._repository.add_medication_schedules(patient_id, new_schedules)

        # 2. Apply decisions and execute each action.
        decisions_by_id = {d.action_id: d for d in decisions}
        executed: list[ExecutedAction] = []
        tracked: list[TrackedAction] = []

        card = self._repository.get_patient_card(patient_id)

        for action in plan.actions:
            decision = decisions_by_id.get(action.id)
            effective_action, status, result = self._dispatch(action, decision, card)

            executed.append(
                ExecutedAction(
                    action=effective_action,
                    status=status,
                    result=result,
                )
            )
            tracked.append(
                TrackedAction(
                    action=effective_action,
                    status=status,
                    executed_at=now,
                    result=result,
                )
            )

        # 3. Persist the stored plan with per-action status.
        stored_plan = StoredActionPlan(
            id=uuid.uuid4().hex,
            created_at=now,
            consultation_id=consultation.id,
            plan=plan,
            tracked_actions=tracked,
        )
        self._repository.save_action_plan(patient_id, stored_plan)

        # 4. Apply patient_card_updates to the stored card.
        updated_card = _apply_card_updates(card, plan, documents, clinical_note)
        self._repository.update_patient_card(patient_id, updated_card)

        return ExecutionResult(executed_actions=executed, updated_card=updated_card)

    def _dispatch(
        self,
        action: Action,
        decision: ActionDecision | None,
        card: PatientCard,
    ) -> tuple[Action, ActionStatus, dict]:
        """Return (effective_action, status, result) for one action."""
        # Default decision = ACCEPT when the caller did not provide one.
        if decision is None or decision.decision == Decision.ACCEPT:
            return self._run(action, card)

        if decision.decision == Decision.REJECT:
            return action, ActionStatus.SKIPPED, {"reason": "rejected by patient"}

        # MODIFY — merge overrides then run.
        merged = action.model_copy(update=decision.overrides)
        return self._run(merged, card)

    def _run(
        self, action: Action, card: PatientCard
    ) -> tuple[Action, ActionStatus, dict]:
        """
        Prepare external resources for an accepted action and return it as
        PENDING (the patient hasn't completed the real-world task yet).
        """
        result: dict = {}

        if action.type in _BOOKABLE_TYPES:
            url = build_doctolib_url(action, card.address)
            if url:
                action = action.model_copy(update={"suggested_url": url})
                result["suggested_url"] = url

        ics = build_ics_for_action(action)
        if ics:
            result["ics"] = ics

        return action, ActionStatus.PENDING, result


def _apply_card_updates(
    card: PatientCard,
    plan: ActionPlan,
    documents: list[MedicalDocument],
    clinical_note: ClinicalNote | None,
) -> PatientCard:
    """
    Merge the plan's free-form patient_card_updates into the stored card,
    and derive durable identity fields (name, doctors) from the current
    upload so the next Pass 1 can use them.

    The updates are loosely structured (LLM output), so we look for well-known
    keys and fall back to appending to `active_conditions` / notes when in doubt.
    """
    new_card = card.model_copy(deep=True)

    # Durable identity: fill from the current upload if still missing.
    if not new_card.name:
        for doc in documents:
            if doc.patient_name:
                new_card.name = doc.patient_name
                break
        if not new_card.name and clinical_note and clinical_note.patient_name:
            new_card.name = clinical_note.patient_name

    # Regular followups: every doctor seen in this upload is added to the card.
    for doc in documents:
        if doc.doctor_name and doc.doctor_name not in new_card.regular_followups:
            new_card.regular_followups.append(doc.doctor_name)
    if (
        clinical_note
        and clinical_note.practitioner
        and clinical_note.practitioner not in new_card.regular_followups
    ):
        new_card.regular_followups.append(clinical_note.practitioner)

    # Pull any current_treatments from PRESCRIPTION documents into the card.
    for doc in documents:
        for med in doc.medications:
            label = med.name
            if med.dosage:
                label = f"{label} {med.dosage}"
            if label and label not in new_card.current_treatments:
                new_card.current_treatments.append(label)

    for update in plan.patient_card_updates:
        field = update.get("field")
        value = update.get("value")
        if not field:
            continue

        if field == "upcoming_procedures":
            _append_to_list(new_card.upcoming_procedures, value)
        elif field == "active_prescriptions" or field == "current_treatments":
            _append_to_list(new_card.current_treatments, value)
        elif field == "active_conditions":
            _append_to_list(new_card.active_conditions, value)
        elif field == "regular_followups":
            _append_to_list(new_card.regular_followups, value)
        elif field == "drug_interactions":
            _append_to_list(new_card.drug_interactions, value)
        # Unknown fields are ignored — LLM is free-form, we don't error out.

    return new_card


def _append_to_list(target: list[str], value) -> None:
    if value is None:
        return
    if isinstance(value, list):
        for item in value:
            _append_to_list(target, item)
        return
    if isinstance(value, dict):
        text = _format_dict(value)
    elif isinstance(value, str):
        text = value
    else:
        text = str(value)
    if text and text not in target:
        target.append(text)


def _format_dict(d: dict) -> str:
    """
    Turn a free-form dict from `plan.patient_card_updates` into a human-readable
    single-line string. Mistral tends to return dicts for medications and
    procedures — we flatten them instead of storing `str(d)`.
    """
    # Medication-shaped dict
    if "name" in d:
        parts: list[str] = [str(d["name"])]
        if d.get("dosage"):
            parts.append(str(d["dosage"]))
        if d.get("frequency"):
            parts.append(str(d["frequency"]))
        if d.get("duration"):
            parts.append(f"({d['duration']})")
        return " ".join(parts)

    # Procedure-shaped dict
    if "procedure" in d:
        parts = [str(d["procedure"])]
        if d.get("date"):
            parts.append(f"on {d['date']}")
        if d.get("doctor"):
            parts.append(f"with {d['doctor']}")
        if d.get("location"):
            parts.append(f"at {d['location']}")
        return " ".join(parts)

    # Fallback: key: value pairs separated by commas.
    return ", ".join(f"{k}: {v}" for k, v in d.items())
