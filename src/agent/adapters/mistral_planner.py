import json

from mistralai import Mistral

from ..domain.models.actions import ActionPlan
from ..domain.models.patient import PatientInput
from ..domain.ports.planner import PlannerPort

PLANNER_MODEL = "mistral-large-latest"

_SYSTEM_PROMPT = """\
You are a post-consultation planning agent for a patient. You receive structured
medical data extracted from a recent consultation:
  - a list of MedicalDocument objects (prescriptions and operation reports),
  - an optional structured ClinicalNote (practitioner's voice note, already parsed),
  - a PatientContext with what we already know about the patient, including
    `known_treatments` (treatments the patient was already on BEFORE this
    consultation, coming from the vault/history).

Your job is to produce a single JSON ActionPlan that matches the schema given
below. You MUST:

1. Decompose every post-operative instruction and every clinical_note.action_items
   entry into atomic, concrete actions with a clear title, a rationale (`why`),
   and a deadline when possible (ISO 8601 date).

2. DO NOT create actions for treatments the patient is already on.
   - If a medication appears in `patient_context.known_treatments`, the patient
     is already taking it — do NOT emit a TAKE_MEDICATION or "continue X" action
     for it. The agent's role is to plan NEW things, not to restate the status
     quo. The only exception is if the new prescription explicitly CHANGES the
     dosage or frequency of a known treatment — in that case emit an action that
     highlights the change.
   - Same logic for procedures: if the context already mentions the upcoming
     procedure, do not re-create an action to "schedule" it.

3. Detect cross-constraints and surface them in `alerts`:
   - Drug interactions between `patient_context.known_treatments` and the new
     prescription or procedure (e.g. lithium and renal procedures).
   - Any instruction that conflicts with the patient's context.
   - Alerts go into the `alerts` field, NOT as actions.

4. Group labs / exams that can be done at the same place on the same day using
   the `group_with` field (set each action's `group_with` to the id of the
   other action in the pair).

5. Assign unique short ids (e.g. "a1", "a2", ...) to every action. Ids must be
   unique across the plan.

6. Use `depends_on` when an action can only start after another is done.

7. Set `priority` to URGENT / HIGH / MEDIUM / LOW based on clinical urgency.

8. Generate `questions_for_next_appointments` by cross-referencing the patient's
   known treatments and context with upcoming procedures or follow-ups mentioned
   in the input. These questions are the PRIMARY vehicle for raising concerns
   about known_treatments × new procedure — prefer a QuestionBundle over a
   standalone action when the goal is to inform the doctor.

9. Leave `suggested_url` as null — it will be filled later by the execution pass.

10. Suggest `patient_card_updates` as a list of free-form {field, value} dicts
    capturing what should be persisted (last consultation, upcoming procedures,
    new active prescriptions, etc.). For `current_treatments` and similar list
    fields, use plain strings like "Lithium 400mg once daily", not nested dicts.

Return ONLY a valid JSON object matching the ActionPlan schema. No prose, no
markdown fences."""

_USER_PROMPT_TEMPLATE = """\
ActionPlan JSON schema (your output must validate against this):
{schema}

PatientInput:
{patient_input}
"""


class MistralPlanner(PlannerPort):
    """Planner implementation calling Mistral in JSON mode."""

    def __init__(self, client: Mistral, model: str = PLANNER_MODEL) -> None:
        self._client = client
        self._model = model

    def plan(self, patient_input: PatientInput) -> ActionPlan:
        user_prompt = _USER_PROMPT_TEMPLATE.format(
            schema=json.dumps(ActionPlan.model_json_schema(), indent=2),
            patient_input=patient_input.model_dump_json(indent=2),
        )

        response = self._client.chat.complete(
            model=self._model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        plan = ActionPlan.model_validate_json(content)
        _assert_unique_ids(plan)
        return plan


def _assert_unique_ids(plan: ActionPlan) -> None:
    ids = [action.id for action in plan.actions]
    if len(ids) != len(set(ids)):
        raise ValueError(f"Planner returned duplicate action ids: {ids}")
