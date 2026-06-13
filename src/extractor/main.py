"""
Demo — medical document parser
================================
Runs parse_document() on every file in img/ and prints the resulting
MedicalDocument Pydantic objects.

Usage:
    python -m extractor.main

Requirements:
    - .env file with MISTRAL_API_KEY and ELEVENLABS_API_KEY
    - pip install -e .
"""

from pathlib import Path
from extractor import parse_document
from extractor.models import DocumentType

IMG_DIR = Path("img")

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp", ".pdf"}

def main() -> None:
    images = sorted(
        p for p in IMG_DIR.iterdir() if p.suffix.lower() in SUPPORTED_EXTENSIONS
    )

    if not images:
        print(f"No supported files found in {IMG_DIR}/")
        return

    for path in images:
        print("=" * 60)
        print(f"File : {path.name}")
        print("=" * 60)

        doc = parse_document(path)

        print(f"Type    : {doc.document_type.value}")
        print(f"Patient : {doc.patient_name}")
        print(f"Doctor  : {doc.doctor_name}")
        print(f"Date    : {doc.date}")

        if doc.document_type == DocumentType.PRESCRIPTION and doc.medications:
            print("Medications:")
            for med in doc.medications:
                parts = [med.name]
                if med.dosage:
                    parts.append(med.dosage)
                if med.frequency:
                    parts.append(med.frequency)
                if med.duration:
                    parts.append(med.duration)
                print(f"  - {' | '.join(parts)}")
                if med.instructions:
                    print(f"    Instructions: {med.instructions}")

        if doc.document_type == DocumentType.OPERATION_REPORT:
            if doc.procedure:
                print(f"Procedure : {doc.procedure}")
            if doc.diagnosis:
                print(f"Diagnosis : {doc.diagnosis}")
            if doc.operative_findings:
                print(f"Findings  : {doc.operative_findings}")
            if doc.post_op_instructions:
                print("Post-op instructions:")
                for instruction in doc.post_op_instructions:
                    print(f"  - {instruction}")

        if doc.follow_up:
            print(f"Follow-up : {doc.follow_up}")
        if doc.notes:
            print(f"Notes     : {doc.notes}")

        print()
        print("--- JSON output ---")
        print(doc.model_dump_json(indent=2))
        print()


if __name__ == "__main__":
    main()
