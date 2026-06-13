from pydantic import BaseModel, Field

from extractor.models import ClinicalNote, MedicalDocument


class PatientContext(BaseModel):
    """
    Minimal patient context derived from the current upload.

    This is intentionally sparse: until we have a vault, we can only populate
    what is directly observable in the MedicalDocument / ClinicalNote. Address,
    current treatments and history will come from the vault in a later iteration.
    """

    name: str | None = Field(default=None, description="Patient full name if known")
    doctors: list[str] = Field(
        default_factory=list,
        description="Doctors and practitioners mentioned in the current upload",
    )
    known_treatments: list[str] = Field(
        default_factory=list,
        description="Treatments the patient is already on (from vault, empty for now)",
    )
    address: str | None = Field(default=None, description="Home address if known")
    notes: str | None = Field(
        default=None, description="Free-form notes aggregated from documents"
    )


class PatientInput(BaseModel):
    """Full input consumed by the planner for Pass 1."""

    documents: list[MedicalDocument]
    clinical_note: ClinicalNote | None = None
    patient_context: PatientContext
