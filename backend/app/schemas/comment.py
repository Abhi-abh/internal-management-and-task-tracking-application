from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.user import UserPublic


# ── Request schemas ───────────────────────────────────────────────────────────
class CommentCreate(BaseModel):
    comment: str = Field(..., min_length=1, max_length=5000)


class CommentUpdate(BaseModel):
    comment: str = Field(..., min_length=1, max_length=5000)


# ── Response schemas ──────────────────────────────────────────────────────────
class CommentResponse(BaseModel):
    id: int
    comment: str
    task_id: int
    user_id: int
    user: UserPublic
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
