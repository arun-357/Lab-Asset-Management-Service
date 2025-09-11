import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

# Ensure project root is on sys.path so 'app' package can be imported regardless of pytest invocation path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import create_app  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.db import base  # noqa: F401,E402 ensures model import side effects

# Prefer explicit test DB URI from env > settings > fallback sqlite
TEST_DB_URL = os.getenv("TEST_DB_URL") or getattr(settings, "TEST_SQLALCHEMY_DATABASE_URI", None) or "sqlite:///./test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False} if TEST_DB_URL.startswith("sqlite") else {})

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    yield
    if TEST_DB_URL.startswith("sqlite"):
        SQLModel.metadata.drop_all(engine)

@pytest.fixture
def db_session():
    with Session(engine) as session:
        yield session

@pytest.fixture
def client(monkeypatch, db_session):
    # Override dependency get_db
    from app.api import deps
    def override_get_db():
        yield db_session
    monkeypatch.setattr(deps, "get_db", override_get_db)

    app = create_app()
    return TestClient(app)
