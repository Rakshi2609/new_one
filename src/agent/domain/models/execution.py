from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from .actions import Action
from .vault import ActionStatus, PatientCard


class Decision(str, Enum):
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"
    MODIFY = "MODIFY"


class ActionDecision(BaseModel):
    """Patient-side decision for a single action in the plan."""

    action_id: str
    decision: Decision
    overrides: dict[str, Any] = Field(
        default_factory=dict,
        description="Fields to overwrite on the action when decision == MODIFY",
    )


class ExecutedAction(BaseModel):
    action: Action
    status: ActionStatus
    result: dict[str, Any] = Field(
        default_factory=dict,
        description="Execution output: suggested_url, ics_content, error, ...",
    )


class ExecutionResult(BaseModel):
    executed_actions: list[ExecutedAction] = Field(default_factory=list)
    updated_card: PatientCard | None = None
