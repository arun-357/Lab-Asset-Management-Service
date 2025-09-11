from typing import Optional
from sqlmodel import SQLModel, Field, Column, String
from enum import Enum
from datetime import datetime

class Role(str, Enum):
    user = "user"
    admin = "admin"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column(String(50), unique=True, nullable=False))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), unique=True))
    full_name: Optional[str] = None
    hashed_password: str
    role: Role = Field(default=Role.user)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
