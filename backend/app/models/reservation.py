from typing import Optional
from sqlmodel import SQLModel, Field
from enum import Enum
from datetime import datetime

class ReservationStatus(str, Enum):
    active = "active"
    cancelled = "cancelled"
    completed = "completed"

class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_id: int
    user_name: str
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = None
    status: ReservationStatus = Field(default=ReservationStatus.active)
    created_at: datetime = Field(default_factory=datetime.utcnow)
