from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class TimelineStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    MISSED = "missed"

class TimelineItemType(str, Enum):
    MEDICATION = "medication"
    TEST = "test"
    APPOINTMENT = "appointment"
    FOLLOW_UP = "follow_up"

class TimelineItem(BaseModel):
    id: str
    date: datetime
    type: TimelineItemType
    title: str
    description: str | None = None
    status: TimelineStatus

class TimelineDay(BaseModel):
    label: str
    date: datetime | None = None
    items: list[TimelineItem]
