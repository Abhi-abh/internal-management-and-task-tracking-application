from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default=UserRole.MEMBER.value)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    created_tasks: Mapped[List["Task"]] = relationship(  # noqa: F821
        "Task", foreign_keys="Task.created_by", back_populates="creator"
    )
    assigned_tasks: Mapped[List["Task"]] = relationship(  # noqa: F821
        "Task", foreign_keys="Task.assigned_to", back_populates="assignee"
    )
    comments: Mapped[List["Comment"]] = relationship(  # noqa: F821
        "Comment", back_populates="user"
    )
    activities: Mapped[List["TaskActivity"]] = relationship(  # noqa: F821
        "TaskActivity", back_populates="user"
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id!r} email={self.email!r}>"
