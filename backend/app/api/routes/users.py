from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.schemas.user import UserList, UserPublic, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def _get_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.get("", response_model=UserList, summary="List users")
def list_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str = Query(default=None),
    role: str = Query(default=None),
    service: UserService = Depends(_get_service),
    _current_user=Depends(get_current_user),
):
    """Return a paginated list of all users."""
    return service.list_users(page=page, limit=limit, search=search, role=role)


@router.post("", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Create a user")
def create_user(
    data: __import__('app.schemas.user', fromlist=['UserCreate']).UserCreate,
    service: UserService = Depends(_get_service),
    _current_user=Depends(get_current_user),
):
    return service.create_user(data)


@router.get("/{user_id}", response_model=UserPublic, summary="Get user by ID")
def get_user(
    user_id: int,
    service: UserService = Depends(_get_service),
    _current_user=Depends(get_current_user),
):
    return service.get_user(user_id)


@router.put("/{user_id}", response_model=UserPublic, summary="Update user")
def update_user(
    user_id: int,
    data: UserUpdate,
    service: UserService = Depends(_get_service),
    _current_user=Depends(get_current_user),
):
    return service.update_user(user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete user")
def delete_user(
    user_id: int,
    service: UserService = Depends(_get_service),
    current_user=Depends(get_current_user),
):
    service.delete_user(user_id, current_user)
