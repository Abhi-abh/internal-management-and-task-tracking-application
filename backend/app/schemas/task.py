from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.models.enums import TaskPriority, TaskStatus


# ── Sub-schemas ───────────────────────────────────────────────────────────────
class UserBrief(BaseModel):
    """Compact user info embedded inside task responses."""
    id: int
    name: str

    model_config = {"from_attributes": True}


# ── Request schemas ───────────────────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: datetime | None = None
    assigned_to: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None
    assigned_to: int | None = None
    is_archived: bool | None = None


class TaskFilters(BaseModel):
    """Query parameters for task list endpoint."""
    search: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    assignee: int | None = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort_by: str = "created_at"
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")


# ── Response schemas ──────────────────────────────────────────────────────────
class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    priority: str
    due_date: datetime | None
    created_by: int
    assigned_to: int | None
    creator: UserBrief
    assignee: UserBrief | None
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    comment_count: int = 0

    model_config = {"from_attributes": True}


class TaskList(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    limit: int
    total_pages: int
