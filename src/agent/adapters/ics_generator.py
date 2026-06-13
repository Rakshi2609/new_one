"""
Minimal RFC 5545 iCalendar generator for action reminders.

We only emit VEVENT / VTODO — no recurrence, no alarms beyond a simple
reminder. Good enough for a hackathon demo where the patient imports the
.ics into any calendar app.
"""

import uuid
from datetime import date, datetime, time, timedelta

from ..domain.models.actions import Action


def _fmt_utc(dt: datetime) -> str:
    return dt.strftime("%Y%m%dT%H%M%SZ")


def _parse_deadline(deadline: str | None) -> date | None:
    if not deadline:
        return None
    try:
        return date.fromisoformat(deadline)
    except ValueError:
        return None


def _escape(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace(",", "\\,")
        .replace(";", "\\;")
        .replace("\n", "\\n")
    )


def build_ics_for_action(action: Action) -> str | None:
    """
    Build a single-event .ics string for an action with a deadline.

    Returns None if the action has no parsable deadline — in that case there
    is nothing to schedule.
    """
    deadline = _parse_deadline(action.deadline)
    if deadline is None:
        return None

    # 1-hour slot at 9:00 local time on the deadline day.
    start_dt = datetime.combine(deadline, time(9, 0))
    end_dt = start_dt + timedelta(hours=1)
    stamp = datetime.utcnow()

    uid = f"{uuid.uuid4().hex}@arwen"

    summary = _escape(action.title)
    description_parts = [action.why]
    if action.constraints:
        description_parts.append("Constraints: " + "; ".join(action.constraints))
    description = _escape("\n".join(description_parts))

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Arwen//Agent//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{_fmt_utc(stamp)}",
        f"DTSTART:{_fmt_utc(start_dt)}",
        f"DTEND:{_fmt_utc(end_dt)}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder",
        "TRIGGER:-PT1H",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\r\n".join(lines) + "\r\n"
