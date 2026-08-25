from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TaskPriority, TaskStatus


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=TaskStatus.PENDING.value, index=True
    )
    priority: Mapped[str] = mapped_column(
        String(50), nullable=False, default=TaskPriority.MEDIUM.value, index=True
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )

    # Relationships
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    assigned_to: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    creator: Mapped["User"] = relationship(  # noqa: F821
        "User", foreign_keys=[created_by], back_populates="created_tasks"
    )
    assignee: Mapped[Optional["User"]] = relationship(  # noqa: F821
        "User", foreign_keys=[assigned_to], back_populates="assigned_tasks"
    )
    comments: Mapped[List["Comment"]] = relationship(  # noqa: F821
        "Comment", back_populates="task", cascade="all, delete-orphan"
    )
    activities: Mapped[List["TaskActivity"]] = relationship(  # noqa: F821
        "TaskActivity", back_populates="task", cascade="all, delete-orphan"
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow, index=True
    )
    is_archived: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Task id={self.id!r} title={self.title!r} status={self.status!r}>"
