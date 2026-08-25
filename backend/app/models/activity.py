from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TaskActivity(Base):
    __tablename__ = "task_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    task_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    old_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )

    task: Mapped["Task"] = relationship("Task", back_populates="activities")  # noqa: F821
    user: Mapped[Optional["User"]] = relationship("User", back_populates="activities")  # noqa: F821

    def __repr__(self) -> str:  # pragma: no cover
        return f"<TaskActivity id={self.id!r} task_id={self.task_id!r} action={self.action!r}>"
