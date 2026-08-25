from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserBrief


class ActivityResponse(BaseModel):
    id: int
    task_id: int
    user_id: int | None
    action: str
    old_value: str | None
    new_value: str | None
    created_at: datetime
    user: UserBrief | None

    model_config = {"from_attributes": True}
