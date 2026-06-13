from pydantic import BaseModel, Field


class ClinicalNote(BaseModel):
    patient_name: str | None = Field(
        default=None, description="Full name of the patient if mentioned"
    )
    practitioner: str | None = Field(
        default=None, description="Name of the dictating practitioner if mentioned"
    )
    date: str | None = Field(
        default=None, description="Date of the note in ISO 8601 format if determinable"
    )
    chief_complaint: str | None = Field(
        default=None, description="Main reason for the consultation or observation"
    )
    observations: str | None = Field(
        default=None,
        description="Clinical observations, symptoms, or examination findings",
    )
    action_items: list[str] = Field(
        default_factory=list,
        description="Actions to take: prescriptions, referrals, exams ordered",
    )
    follow_up: str | None = Field(
        default=None, description="Follow-up instructions or next appointment"
    )
