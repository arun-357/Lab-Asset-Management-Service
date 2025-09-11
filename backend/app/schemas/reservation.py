from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.reservation import ReservationStatus

class ReservationCreate(BaseModel):
    asset_id: int
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = None

class ReservationRead(BaseModel):
    id: int
    asset_id: int
    user_name: str
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = None
    status: ReservationStatus

    class Config:
        orm_mode = True
