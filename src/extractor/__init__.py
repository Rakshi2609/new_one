import os
from pathlib import Path

from dotenv import load_dotenv
from mistralai import Mistral

from .extractor import Extractor
from .models import ClinicalNote, MedicalDocument
from .parsers import AudioParser, DocumentParser

load_dotenv()


def _mistral_client() -> Mistral:
    api_key = os.environ["MISTRAL_API_KEY"]
    return Mistral(api_key=api_key)


def _elevenlabs_key() -> str:
    return os.environ["ELEVENLABS_API_KEY"]


def parse_document(image_path: str | Path) -> MedicalDocument:
    """
    Parse any medical document photo (prescription or operation report).

    Accepts images (JPG, PNG, TIFF…) and PDFs.
    Returns a MedicalDocument with document_type set automatically.
    """
    client = _mistral_client()
    ocr_text = DocumentParser(client).parse(image_path)
    return Extractor(client).extract_document(ocr_text)


def parse_audio_note(audio_path: str | Path) -> ClinicalNote:
    """Transcribe a voice recording and extract a ClinicalNote."""
    transcript = AudioParser(_elevenlabs_key()).transcribe(audio_path)
    return Extractor(_mistral_client()).extract_clinical_note(transcript)


__all__ = [
    "parse_document",
    "parse_audio_note",
    "MedicalDocument",
    "ClinicalNote",
]
