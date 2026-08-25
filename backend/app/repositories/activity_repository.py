from __future__ import annotations

from sqlalchemy.orm import Session, joinedload

from app.models.activity import TaskActivity


class ActivityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_task(self, task_id: int) -> list[TaskActivity]:
        return (
            self.db.query(TaskActivity)
            .options(joinedload(TaskActivity.user))
            .filter(TaskActivity.task_id == task_id)
            .order_by(TaskActivity.created_at.desc())
            .all()
        )

    def create(
        self,
        *,
        task_id: int,
        user_id: int | None,
        action: str,
        old_value: str | None = None,
        new_value: str | None = None,
    ) -> TaskActivity:
        activity = TaskActivity(
            task_id=task_id,
            user_id=user_id,
            action=action,
            old_value=old_value,
            new_value=new_value,
        )
        self.db.add(activity)
        self.db.flush()
        return activity
