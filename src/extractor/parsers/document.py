import base64
from pathlib import Path

from mistralai import Mistral

_IMAGE_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".tiff": "image/tiff",
    ".bmp": "image/bmp",
}


class DocumentParser:
    """Extracts text from prescription images and PDF reports via Mistral OCR."""

    def __init__(self, client: Mistral) -> None:
        self._client = client

    def parse(self, file_path: str | Path) -> str:
        """
        Run OCR on an image or PDF file.

        Returns the extracted content as a single markdown string
        (one section per page for PDFs).
        """
        path = Path(file_path)
        suffix = path.suffix.lower()

        with open(path, "rb") as f:
            encoded = base64.standard_b64encode(f.read()).decode()

        if suffix in _IMAGE_MIME_TYPES:
            mime = _IMAGE_MIME_TYPES[suffix]
            document = {
                "type": "image_url",
                "image_url": f"data:{mime};base64,{encoded}",
            }
        elif suffix == ".pdf":
            document = {
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{encoded}",
            }
        else:
            raise ValueError(
                f"Unsupported file format '{suffix}'. "
                f"Supported: {sorted(_IMAGE_MIME_TYPES)} + ['.pdf']"
            )

        response = self._client.ocr.process(
            model="mistral-ocr-latest",
            document=document,
        )

        return "\n\n".join(page.markdown for page in response.pages)
