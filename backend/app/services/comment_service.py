from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.comment_repository import CommentRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse


class CommentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = CommentRepository(db)
        self.task_repo = TaskRepository(db)
        self.activity_repo = ActivityRepository(db)

    def list_by_task(self, task_id: int) -> list[CommentResponse]:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
        
        comments = self.repo.list_by_task(task_id)
        return [CommentResponse.model_validate(c) for c in comments]

    def create_comment(self, task_id: int, data: CommentCreate, current_user: User) -> CommentResponse:
        try:
            task = self.task_repo.get_by_id(task_id)
            if not task:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

            comment = self.repo.create(task_id=task_id, user_id=current_user.id, comment=data.comment)
            
            # Log activity
            self.activity_repo.create(
                task_id=task_id,
                user_id=current_user.id,
                action="comment_added"
            )

            self.db.commit()
            return CommentResponse.model_validate(comment)
        except Exception as e:
            self.db.rollback()
            raise e

    def update_comment(self, comment_id: int, data: CommentUpdate, current_user: User) -> CommentResponse:
        try:
            comment = self.repo.get_by_id(comment_id)
            if not comment:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
            
            if comment.user_id != current_user.id and current_user.role != "admin":
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this comment.")
            
            comment = self.repo.update(comment, content=data.comment)
            self.db.commit()
            return CommentResponse.model_validate(comment)
        except Exception as e:
            self.db.rollback()
            raise e

    def delete_comment(self, comment_id: int, current_user: User) -> None:
        try:
            comment = self.repo.get_by_id(comment_id)
            if not comment:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
            
            if comment.user_id != current_user.id and current_user.role != "admin":
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment.")
            
            self.repo.delete(comment)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e
