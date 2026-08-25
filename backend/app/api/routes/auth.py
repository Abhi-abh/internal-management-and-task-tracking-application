from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.schemas.token import Token
from app.schemas.user import UserPublic, UserRegister
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserPublic, status_code=201, summary="Register new user")
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Create a new user account. Returns the created user profile."""
    service = AuthService(db)
    user = service.register(data)
    return UserPublic.model_validate(user)


@router.post("/login", response_model=Token, summary="Login and get JWT token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticate with email and password.
    Returns a Bearer JWT token for use in subsequent requests.

    Note: The `username` field in the OAuth2 form is used as email.
    """
    service = AuthService(db)
    return service.login(email=form_data.username, password=form_data.password)


@router.get("/me", response_model=UserPublic, summary="Get current user")
def get_me(current_user=Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return UserPublic.model_validate(current_user)
