from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegister
from app.schemas.token import Token


class AuthService:
    """Business logic for authentication."""

    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def register(self, data: UserRegister):
        """Register a new user account."""
        email = data.email.lower()
        if self.repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        user = self.repo.create(
            name=data.name,
            email=email,
            password_hash=hash_password(data.password),
            role="admin",
        )
        self.repo.db.commit()
        return user

    def login(self, *, email: str, password: str) -> Token:
        """Authenticate user and return a JWT token."""
        email = email.lower()
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is inactive.",
            )
        access_token = create_access_token(data={"sub": str(user.id)})
        return Token(access_token=access_token)
