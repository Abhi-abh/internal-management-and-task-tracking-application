from __future__ import annotations

from pydantic import BaseModel


class Token(BaseModel):
    """JWT access token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded JWT payload data."""
    user_id: int | None = None
