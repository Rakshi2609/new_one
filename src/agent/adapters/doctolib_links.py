"""
Deterministic Doctolib deep-link builder.

We never call the Doctolib API — we just construct search URLs that the
patient can click to land on a pre-filtered Doctolib search page.
"""

import re
from urllib.parse import quote_plus

from ..domain.models.actions import Action, ActionType

_DOCTOLIB_SEARCH = "https://www.doctolib.fr/search"

# Mapping from ActionType → search query hint
_QUERY_BY_TYPE = {
    ActionType.BOOK_LAB: "laboratoire analyses médicales",
    ActionType.BOOK_IMAGING: "radiologie imagerie médicale",
    ActionType.BOOK_APPOINTMENT: "médecin généraliste",
    ActionType.BOOK_TRANSPORT: "transport sanitaire vsl",
}


def _extract_zip(address: str | None) -> str | None:
    if not address:
        return None
    match = re.search(r"\b(\d{5})\b", address)
    return match.group(1) if match else None


def build_doctolib_url(action: Action, patient_address: str | None) -> str | None:
    """
    Build a Doctolib search URL for a bookable action.

    Returns None if the action type is not bookable via Doctolib
    (e.g. ADD_REMINDER, TAKE_MEDICATION).
    """
    base_query = _QUERY_BY_TYPE.get(action.type)
    if base_query is None:
        return None

    zip_code = _extract_zip(patient_address)
    location = zip_code or "Paris"

    return f"{_DOCTOLIB_SEARCH}?query={quote_plus(base_query)}&location={quote_plus(location)}"
