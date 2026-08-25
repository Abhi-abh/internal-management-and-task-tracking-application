from __future__ import annotations

from typing import Optional

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.task import Task
from app.schemas.task import TaskFilters


class TaskRepository:
    """All database operations for the Task model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return (
            self.db.query(Task)
            .options(
                joinedload(Task.creator),
                joinedload(Task.assignee),
                selectinload(Task.comments),
            )
            .filter(Task.id == task_id)
            .first()
        )

    def list_tasks(self, filters: TaskFilters) -> tuple[list[Task], int]:
        query = (
            self.db.query(Task)
            .options(
                joinedload(Task.creator), 
                joinedload(Task.assignee),
                selectinload(Task.comments)
            )
        )

        # Filters
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term),
                )
            )
        if filters.status:
            query = query.filter(Task.status == filters.status.value)
        if filters.priority:
            query = query.filter(Task.priority == filters.priority.value)
        if filters.assignee is not None:
            query = query.filter(Task.assigned_to == filters.assignee)

        # Sorting
        allowed_sort_fields = {
            "created_at": Task.created_at,
            "updated_at": Task.updated_at,
            "due_date": Task.due_date,
            "title": Task.title,
            "priority": Task.priority,
            "status": Task.status,
        }
        sort_col = allowed_sort_fields.get(filters.sort_by, Task.created_at)
        order_fn = asc if filters.sort_order == "asc" else desc
        query = query.order_by(order_fn(sort_col))

        total = query.count()

        # Pagination
        skip = (filters.page - 1) * filters.limit
        tasks = query.offset(skip).limit(filters.limit).all()
        return tasks, total

    def create(self, *, created_by: int, **fields) -> Task:
        task = Task(created_by=created_by, **fields)
        self.db.add(task)
        self.db.flush()
        return task

    def update(self, task: Task, **fields) -> Task:
        for key, value in fields.items():
            setattr(task, key, value)
        self.db.flush()
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.flush()

    def get_dashboard_stats(self, user_id: int) -> dict:
        total = self.db.query(func.count(Task.id)).scalar() or 0
        pending = self.db.query(func.count(Task.id)).filter(Task.status == "pending").scalar() or 0
        in_progress = self.db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar() or 0
        completed = self.db.query(func.count(Task.id)).filter(Task.status == "completed").scalar() or 0
        blocked = self.db.query(func.count(Task.id)).filter(Task.status == "blocked").scalar() or 0
        
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        overdue = self.db.query(func.count(Task.id)).filter(
            Task.due_date < now, 
            Task.status != "completed"
        ).scalar() or 0

        current_user_tasks = self.db.query(func.count(Task.id)).filter(Task.assigned_to == user_id).scalar() or 0

        return {
            "total_tasks": total,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "blocked_tasks": blocked,
            "overdue_tasks": overdue,
            "current_user_tasks": current_user_tasks,
        }

