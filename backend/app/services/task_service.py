from __future__ import annotations

import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.task import TaskCreate, TaskFilters, TaskList, TaskResponse, TaskUpdate


class TaskService:
    """Business logic for task management."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = TaskRepository(db)
        self.activity_repo = ActivityRepository(db)

    def _task_to_response(self, task: Task) -> TaskResponse:
        comment_count = len(task.comments) if task.comments is not None else 0
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            created_by=task.created_by,
            assigned_to=task.assigned_to,
            creator=task.creator,
            assignee=task.assignee,
            created_at=task.created_at,
            updated_at=task.updated_at,
            is_archived=task.is_archived,
            comment_count=comment_count,
        )

    def list_tasks(self, filters: TaskFilters) -> TaskList:
        tasks, total = self.repo.list_tasks(filters)
        total_pages = math.ceil(total / filters.limit) if total > 0 else 1
        return TaskList(
            items=[self._task_to_response(t) for t in tasks],
            total=total,
            page=filters.page,
            limit=filters.limit,
            total_pages=total_pages,
        )

    def get_task(self, task_id: int) -> TaskResponse:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
        return self._task_to_response(task)

    def create_task(self, data: TaskCreate, current_user: User) -> TaskResponse:
        try:
            task_data = data.model_dump(exclude_none=False)
            task = self.repo.create(created_by=current_user.id, **task_data)
            
            self.activity_repo.create(
                task_id=task.id,
                user_id=current_user.id,
                action="task_created"
            )
            self.db.commit()
            return self.get_task(task.id)
        except Exception as e:
            self.db.rollback()
            raise e

    def update_task(self, task_id: int, data: TaskUpdate, current_user: User) -> TaskResponse:
        try:
            task = self.repo.get_by_id(task_id)
            if not task:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
            
            update_data = data.model_dump(exclude_unset=True)
            
            old_status = task.status
            old_priority = task.priority
            old_assignee = task.assigned_to
            
            # Convert enum values to strings for storage
            if "status" in update_data and update_data["status"] is not None:
                update_data["status"] = update_data["status"].value
            if "priority" in update_data and update_data["priority"] is not None:
                update_data["priority"] = update_data["priority"].value
            
            task = self.repo.update(task, **update_data)
            
            activity_created = False
            
            if "status" in update_data and old_status != task.status:
                self.activity_repo.create(
                    task_id=task.id, user_id=current_user.id, action="status_changed",
                    old_value=old_status, new_value=task.status
                )
                activity_created = True
                
            if "priority" in update_data and old_priority != task.priority:
                self.activity_repo.create(
                    task_id=task.id, user_id=current_user.id, action="priority_changed",
                    old_value=old_priority, new_value=task.priority
                )
                activity_created = True
                
            if "assigned_to" in update_data and old_assignee != task.assigned_to:
                self.activity_repo.create(
                    task_id=task.id, user_id=current_user.id, action="assignee_changed",
                    old_value=str(old_assignee) if old_assignee else None, 
                    new_value=str(task.assigned_to) if task.assigned_to else None
                )
                activity_created = True

            if not activity_created and len(update_data) > 0:
                self.activity_repo.create(
                    task_id=task.id, user_id=current_user.id, action="task_updated"
                )

            self.db.commit()
            return self.get_task(task.id)
        except Exception as e:
            self.db.rollback()
            raise e

    def delete_task(self, task_id: int, current_user: User) -> None:
        try:
            task = self.repo.get_by_id(task_id)
            if not task:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
            self.repo.delete(task)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e

    def get_dashboard_stats(self, current_user: User) -> dict:
        return self.repo.get_dashboard_stats(user_id=current_user.id)
