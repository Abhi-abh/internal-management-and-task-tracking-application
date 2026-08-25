from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session, joinedload

from app.models.comment import Comment


class CommentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, comment_id: int) -> Optional[Comment]:
        return (
            self.db.query(Comment)
            .options(joinedload(Comment.user))
            .filter(Comment.id == comment_id)
            .first()
        )

    def list_by_task(self, task_id: int) -> list[Comment]:
        return (
            self.db.query(Comment)
            .options(joinedload(Comment.user))
            .filter(Comment.task_id == task_id)
            .order_by(Comment.created_at.asc())
            .all()
        )

    def create(self, *, task_id: int, user_id: int, comment: str) -> Comment:
        new_comment = Comment(task_id=task_id, user_id=user_id, comment=comment)
        self.db.add(new_comment)
        self.db.flush()
        return new_comment

    def update(self, comment: Comment, *, content: str) -> Comment:
        comment.comment = content
        self.db.flush()
        return comment

    def delete(self, comment: Comment) -> None:
        self.db.delete(comment)
        self.db.flush()
