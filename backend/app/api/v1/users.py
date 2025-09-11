from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_admin
from app.crud import crud_user
from app.models.user import User
from app.schemas.user import UserRead, UserAdminCreate, UserUpdate
from app.models.user import Role

router = APIRouter()

@router.get("/", response_model=List[UserRead], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def admin_create_user(payload: UserAdminCreate, db: Session = Depends(get_db)):
    existing = crud_user.get_user_by_username(db, payload.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    role = payload.role or Role.user
    user = crud_user.create_user(db, payload, role=role)
    return user

@router.patch("/{username}", response_model=UserRead, dependencies=[Depends(require_admin)])
def admin_update_user(username: str, payload: UserUpdate, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        user.email = payload.email
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
