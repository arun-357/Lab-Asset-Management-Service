from pydantic import BaseModel, IPvAnyAddress
from typing import Optional

class AssetCreate(BaseModel):
    name: str
    ip_address: IPvAnyAddress
    description: Optional[str] = None

class AssetRead(BaseModel):
    id: int
    name: str
    ip_address: str
    description: Optional[str] = None

    class Config:
        orm_mode = True
