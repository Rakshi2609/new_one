from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ActionType(str, Enum):
    BOOK_LAB = "BOOK_LAB"
    BOOK_IMAGING = "BOOK_IMAGING"
    BOOK_APPOINTMENT = "BOOK_APPOINTMENT"
    BOOK_TRANSPORT = "BOOK_TRANSPORT"
    ADD_REMINDER = "ADD_REMINDER"
    TAKE_MEDICATION = "TAKE_MEDICATION"
    QUESTION_FOR_DOCTOR = "QUESTION_FOR_DOCTOR"


class Priority(str, Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Action(BaseModel):
    id: str = Field(description="Unique id within the plan, short string")
    type: ActionType
    title: str
    why: str = Field(description="Short rationale explaining why this action matters")
    deadline: str | None = Field(
        default=None, description="ISO 8601 date by which the action should be done"
    )
    constraints: list[str] = Field(default_factory=list)
    depends_on: list[str] = Field(
        default_factory=list,
        description="Ids of other actions that must be completed first",
    )
    priority: Priority = Priority.MEDIUM
    group_with: str | None = Field(
        default=None,
        description="Id of another action this one can be grouped with (logistics)",
    )
    suggested_url: str | None = Field(
        default=None,
        description="Reserved for Pass 2 — booking URL (e.g. Doctolib) to propose to the patient",
    )


class QuestionBundle(BaseModel):
    appointment: str = Field(
        description="Human-readable identifier of the next appointment this targets"
    )
    questions: list[str]
    reasoning: str = Field(
        description="Why these questions matter — cross-reference the agent performed"
    )


class ActionPlan(BaseModel):
    actions: list[Action] = Field(default_factory=list)
    questions_for_next_appointments: list[QuestionBundle] = Field(default_factory=list)
    alerts: list[str] = Field(
        default_factory=list,
        description="Safety-critical warnings surfaced to the patient (drug interactions, etc.)",
    )
    patient_card_updates: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Free-form updates to apply to the patient card in the vault",
    )
