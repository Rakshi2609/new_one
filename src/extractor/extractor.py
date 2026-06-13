from mistralai import Mistral

from .models import ClinicalNote, MedicalDocument

EXTRACTION_MODEL = "mistral-large-latest"

_DOCUMENT_PROMPT = """\
You are a medical document parser. A patient photographed a document received from their doctor.
Identify the document type and extract all available information.

Rules:
- Set document_type to "prescription" if the document lists medications to take.
- Set document_type to "operation_report" if the document describes a surgical procedure or post-operative care.
- Set document_type to "other" for anything else.
- Leave fields as null or empty list when the information is absent or illegible.

Return a single JSON object with these fields:
{schema}

OCR TEXT:
{text}
"""

_CLINICAL_NOTE_PROMPT = """\
You are a medical transcription assistant.
Extract key medical information from the following voice recording transcript dictated by a healthcare professional.
For action_items, return each action (prescription, referral, exam ordered) as a separate list item.
Leave fields as null when not mentioned.

Return a single JSON object with these fields:
{schema}

TRANSCRIPT:
{text}
"""


class Extractor:
    """Converts OCR text or transcript into validated Pydantic models."""

    def __init__(self, client: Mistral) -> None:
        self._client = client

    def extract_document(self, ocr_text: str) -> MedicalDocument:
        prompt = _DOCUMENT_PROMPT.format(
            schema=MedicalDocument.model_json_schema(),
            text=ocr_text,
        )
        response = self._client.chat.complete(
            model=EXTRACTION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return MedicalDocument.model_validate_json(response.choices[0].message.content)

    def extract_clinical_note(self, transcript: str) -> ClinicalNote:
        prompt = _CLINICAL_NOTE_PROMPT.format(
            schema=ClinicalNote.model_json_schema(),
            text=transcript,
        )
        response = self._client.chat.complete(
            model=EXTRACTION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return ClinicalNote.model_validate_json(response.choices[0].message.content)
