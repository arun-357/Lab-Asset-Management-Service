from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.api.deps import get_db
from app.crud import crud_user
from app.schemas.user import UserCreate, UserRead
from app.models.user import User, Role
from app.schemas.token import Token
from app.core.security import create_access_token
from app.core.config import settings

router = APIRouter()

@router.get("/bootstrap-status")
def bootstrap_status(db: Session = Depends(get_db)):
    """Public endpoint indicating whether zero users exist (system bootstrap)."""
    empty = db.query(User).count() == 0
    return {"empty": empty}

@router.post("/register", response_model=UserRead, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = crud_user.get_user_by_username(db, payload.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    # Bootstrap: first ever user becomes admin automatically
    is_first = db.query(User).count() == 0
    role = Role.admin if is_first else Role.user
    user = crud_user.create_user(db, payload, role=role)
    return user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud_user.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=user.username, expires_delta=access_token_expires, scopes=[user.role.value])
    return {"access_token": token, "token_type": "bearer"}
