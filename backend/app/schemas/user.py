from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


# ── Request schemas ───────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    role: UserRole | None = None


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# ── Response schemas ──────────────────────────────────────────────────────────
class UserPublic(BaseModel):
    """Minimal user info safe to expose in API responses."""
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserBrief(BaseModel):
    """Brief user info for nested relationships."""
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class UserList(BaseModel):
    """Used in paginated list responses."""
    items: list[UserPublic]
    total: int
    page: int
    limit: int
    total_pages: int
