from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError
from app.db.session import get_session
from app.crud import crud_user
from app.schemas.token import TokenPayload
from app.core.config import settings
from app.core.security import decode_access_token
from app.models.user import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

def get_db():
    yield from get_session()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import JWTError
    from app.schemas.token import TokenPayload

    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = crud_user.get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def require_admin(user = Depends(get_current_user)):
    if user.role != Role.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user
