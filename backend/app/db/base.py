# central import of models so SQLModel metadata includes them
from sqlmodel import SQLModel
# import models below so they get registered in metadata
from app.models import asset, reservation, user  # noqa: F401
