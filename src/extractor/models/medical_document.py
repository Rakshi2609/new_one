from enum import Enum

from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    PRESCRIPTION = "prescription"
    OPERATION_REPORT = "operation_report"
    OTHER = "other"


class Medication(BaseModel):
    name: str = Field(description="Drug name (generic or brand)")
    dosage: str | None = Field(
        default=None, description="Dose per intake, e.g. '500mg'"
    )
    frequency: str | None = Field(
        default=None, description="How often, e.g. '3 times a day'"
    )
    duration: str | None = Field(
        default=None, description="Treatment duration, e.g. '7 days'"
    )
    route: str | None = Field(
        default=None, description="Administration route, e.g. 'oral', 'IV'"
    )
    instructions: str | None = Field(default=None, description="Special instructions")


class MedicalDocument(BaseModel):
    document_type: DocumentType = Field(
        description="Type of document: 'prescription', 'operation_report', or 'other'"
    )
    patient_name: str | None = Field(
        default=None, description="Full name of the patient"
    )
    doctor_name: str | None = Field(
        default=None, description="Full name of the doctor or surgeon"
    )
    doctor_id: str | None = Field(
        default=None, description="Doctor identifier, e.g. RPPS number"
    )
    date: str | None = Field(
        default=None, description="Document date in ISO 8601 format if determinable"
    )

    # Prescription fields
    medications: list[Medication] = Field(
        default_factory=list,
        description="Prescribed medications. Populated when document_type is 'prescription'.",
    )

    # Operation report fields
    procedure: str | None = Field(
        default=None, description="Name of the surgical procedure"
    )
    diagnosis: str | None = Field(
        default=None, description="Pre- or post-operative diagnosis"
    )
    operative_findings: str | None = Field(
        default=None, description="Key findings during surgery"
    )
    post_op_instructions: list[str] = Field(
        default_factory=list,
        description="Post-operative care instructions. Populated when document_type is 'operation_report'.",
    )
    follow_up: str | None = Field(
        default=None, description="Follow-up appointment or recommendations"
    )

    notes: str | None = Field(
        default=None, description="Any other relevant information on the document"
    )
