from fastapi import APIRouter
from app.api.v1 import assets, reservations, users, auth

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
