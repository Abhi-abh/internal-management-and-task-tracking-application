from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """All database operations for the User model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 100, search: str = None, role: str = None) -> tuple[list[User], int]:
        from sqlalchemy import or_
        query = self.db.query(User)
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        if role:
            query = query.filter(User.role == role)
        total = query.count()
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        return users, total

    def create(
        self,
        *,
        name: str,
        email: str,
        password_hash: str,
        role: str,
    ) -> User:
        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=role,
        )
        self.db.add(user)
        self.db.flush()
        return user

    def update(self, user: User, **fields) -> User:
        for key, value in fields.items():
            if value is not None:
                setattr(user, key, value)
        self.db.flush()
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()

    def set_active(self, user: User, *, is_active: bool) -> User:
        user.is_active = is_active
        self.db.flush()
        return user
