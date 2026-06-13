"""
CLI entry point to run Pass 1 on a fixture without spinning up uvicorn.

Usage:
    uv run python -m agent.api.cli fixtures/urologie_case.json
"""

import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from extractor.models import ClinicalNote, MedicalDocument

from .main import get_plan_service


def main() -> None:
    load_dotenv()

    if len(sys.argv) != 2:
        print("Usage: python -m agent.api.cli <fixture.json>", file=sys.stderr)
        sys.exit(2)

    fixture_path = Path(sys.argv[1])
    raw = json.loads(fixture_path.read_text())

    documents = [MedicalDocument.model_validate(d) for d in raw["documents"]]
    clinical_note_data = raw.get("clinical_note")
    clinical_note = (
        ClinicalNote.model_validate(clinical_note_data) if clinical_note_data else None
    )

    service = get_plan_service()
    plan = service.plan_from_raw(documents, clinical_note)

    print(plan.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
