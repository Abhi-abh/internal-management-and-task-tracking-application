from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

# Force SQLite for tests BEFORE importing the app
TEST_DATABASE_URL = "sqlite:///./test_taskboard_isolated.db"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"

from app.core.dependencies import get_db
from app.db.base import Base
from app.main import app
from app.core.security import hash_password

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Enable foreign keys for sqlite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables before tests, drop after."""
    import app.models
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_taskboard_isolated.db"):
        os.remove("./test_taskboard_isolated.db")


@pytest.fixture
def db_session():
    """Provides an isolated database session with a rollback after every test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """HTTP test client with DB override."""
    def override_get_db_session():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def test_users(db_session):
    from app.models.user import User
    from app.models.enums import UserRole
    
    admin = User(name="Admin", email="admin@example.com", password_hash=hash_password("password123"), role=UserRole.ADMIN)
    manager = User(name="Manager", email="manager@example.com", password_hash=hash_password("password123"), role=UserRole.MANAGER)
    member = User(name="Member", email="member@example.com", password_hash=hash_password("password123"), role=UserRole.MEMBER)
    
    db_session.add_all([admin, manager, member])
    db_session.flush()
    return {"admin": admin, "manager": manager, "member": member}


@pytest.fixture
def auth_headers_admin(client, test_users):
    response = client.post("/api/v1/auth/login", data={"username": "admin@example.com", "password": "password123"})
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

@pytest.fixture
def auth_headers_manager(client, test_users):
    response = client.post("/api/v1/auth/login", data={"username": "manager@example.com", "password": "password123"})
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

@pytest.fixture
def auth_headers_member(client, test_users):
    response = client.post("/api/v1/auth/login", data={"username": "member@example.com", "password": "password123"})
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

