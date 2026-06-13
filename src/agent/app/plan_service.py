from extractor.models import ClinicalNote, MedicalDocument

from ..domain.models.actions import ActionPlan
from ..domain.models.patient import PatientContext, PatientInput
from ..domain.models.vault import PatientHistory
from ..domain.ports.planner import PlannerPort
from ..domain.ports.repository import PatientRepository


def _first_non_null(*values: str | None) -> str | None:
    for value in values:
        if value:
            return value
    return None


def _merge_unique(base: list[str], extra: list[str]) -> list[str]:
    out = list(base)
    for value in extra:
        if value and value not in out:
            out.append(value)
    return out


def derive_patient_context(
    documents: list[MedicalDocument],
    clinical_note: ClinicalNote | None,
    history: PatientHistory | None = None,
) -> PatientContext:
    """
    Build a PatientContext from the current upload, enriched by the vault.

    When a vault history is provided, its `patient_card` takes precedence
    for durable fields (address, active_conditions, current_treatments,
    regular_followups) and is merged with what we can read from the current
    upload.
    """
    card = history.patient_card if history else None

    # Identity — prefer vault, fall back to current documents / note.
    card_name = card.name if card else None
    upload_name = _first_non_null(
        *(doc.patient_name for doc in documents),
        clinical_note.patient_name if clinical_note else None,
    )
    name = card_name or upload_name

    # Doctors — merge vault followups with doctors seen in current upload.
    upload_doctors: list[str] = []
    for doc in documents:
        if doc.doctor_name:
            upload_doctors.append(doc.doctor_name)
    if clinical_note and clinical_note.practitioner:
        upload_doctors.append(clinical_note.practitioner)
    doctors = _merge_unique(
        card.regular_followups if card else [],
        upload_doctors,
    )

    # Known treatments — come only from the vault. We do NOT auto-add meds
    # from the current prescription because they are not yet confirmed as
    # "ongoing" until the patient validates the plan.
    known_treatments = list(card.current_treatments) if card else []

    address = card.address if card else None

    note_fragments = [doc.notes for doc in documents if doc.notes]
    notes = "\n".join(note_fragments) if note_fragments else None

    return PatientContext(
        name=name,
        doctors=doctors,
        known_treatments=known_treatments,
        address=address,
        notes=notes,
    )


class PlanService:
    """
    Orchestrates Pass 1: fetches vault history, derives the enriched context,
    and delegates to the planner.

    Pass 1 is read-only w.r.t. the vault — nothing is persisted here. The
    ExecutionService is responsible for writing the validated plan after the
    patient confirms it.
    """

    def __init__(
        self,
        planner: PlannerPort,
        repository: PatientRepository | None = None,
    ) -> None:
        self._planner = planner
        self._repository = repository

    def plan(self, patient_input: PatientInput) -> ActionPlan:
        return self._planner.plan(patient_input)

    def plan_from_raw(
        self,
        documents: list[MedicalDocument],
        clinical_note: ClinicalNote | None,
        patient_id: str | None = None,
    ) -> ActionPlan:
        history: PatientHistory | None = None
        if self._repository is not None and patient_id is not None:
            history = self._repository.get_history(patient_id)

        context = derive_patient_context(documents, clinical_note, history)
        patient_input = PatientInput(
            documents=documents,
            clinical_note=clinical_note,
            patient_context=context,
        )
        return self._planner.plan(patient_input)
