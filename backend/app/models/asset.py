from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Asset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    ip_address: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
