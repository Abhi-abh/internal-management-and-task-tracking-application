from __future__ import annotations

import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.user import UserList, UserPublic, UserUpdate
from app.models.enums import UserRole


class UserService:
    """Business logic for user management."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = UserRepository(db)
        self.task_repo = TaskRepository(db)

    def get_user(self, user_id: int) -> UserPublic:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
            )
        return UserPublic.model_validate(user)

    def list_users(self, page: int = 1, limit: int = 20, search: str = None, role: str = None) -> UserList:
        skip = (page - 1) * limit
        users, total = self.repo.get_all(skip=skip, limit=limit, search=search, role=role)
        total_pages = math.ceil(total / limit) if total > 0 else 1
        return UserList(
            items=[UserPublic.model_validate(u) for u in users],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    def create_user(self, data) -> UserPublic:
        email = data.email.lower()
        if self.repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        from app.core.security import hash_password
        user = self.repo.create(
            name=data.name,
            email=email,
            password_hash=hash_password(data.password),
            role=data.role.value,
        )
        self.db.commit()
        return UserPublic.model_validate(user)

    def update_user(self, user_id: int, data: UserUpdate) -> UserPublic:
        try:
            user = self.repo.get_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
                )
            update_fields = data.model_dump(exclude_unset=True)

            # Check email uniqueness
            if "email" in update_fields:
                existing = self.repo.get_by_email(update_fields["email"])
                if existing and existing.id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email already in use.",
                    )
            
            if "role" in update_fields and update_fields["role"]:
                update_fields["role"] = update_fields["role"].value

            user = self.repo.update(user, **update_fields)
            self.db.commit()
            return UserPublic.model_validate(user)
        except Exception as e:
            self.db.rollback()
            raise e

    def delete_user(self, user_id: int, current_user: User) -> None:
        try:
            user = self.repo.get_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
                )
            
            if user.id == current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete your own account."
                )

            from app.models.task import Task
            from sqlalchemy import func
            
            created_tasks_count = self.db.query(func.count(Task.id)).filter(Task.created_by == user.id).scalar() or 0
            assigned_tasks_count = self.db.query(func.count(Task.id)).filter(Task.assigned_to == user.id).scalar() or 0

            if created_tasks_count > 0 or assigned_tasks_count > 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Cannot delete user referenced by tasks. Consider deactivating instead."
                )

            self.repo.delete(user)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e
