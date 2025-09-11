from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_admin
from app.crud import crud_user
from app.schemas.user import UserRead

router = APIRouter()

@router.get("/", response_model=List[UserRead], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    # admin-only
    return db.query(crud_user.User).all()
