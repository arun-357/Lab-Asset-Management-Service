from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
from typing import Generator
from app.core.config import settings

# Engine
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False, pool_pre_ping=True)

# Session generator for dependencies
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    # For dev convenience: create all tables. In production use migrations.
    SQLModel.metadata.create_all(bind=engine)
