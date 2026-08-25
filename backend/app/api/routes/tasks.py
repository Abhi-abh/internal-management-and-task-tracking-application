from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.enums import TaskPriority, TaskStatus
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from app.schemas.task import TaskCreate, TaskList, TaskResponse, TaskUpdate, TaskFilters
from app.schemas.activity import ActivityResponse
from app.services.task_service import TaskService
from app.services.comment_service import CommentService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def _get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)

def _get_comment_service(db: Session = Depends(get_db)) -> CommentService:
    return CommentService(db)


@router.get("", response_model=TaskList, summary="List tasks")
def list_tasks(
    search: str | None = Query(default=None, description="Search in title and description"),
    status: TaskStatus | None = Query(default=None),
    priority: TaskPriority | None = Query(default=None),
    assignee: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    service: TaskService = Depends(_get_task_service),
    _current_user=Depends(get_current_user),
):
    """
    Return a paginated, filterable, sortable list of tasks.
    Supports search, status/priority/assignee filters, and custom sorting.
    """
    filters = TaskFilters(
        search=search,
        status=status,
        priority=priority,
        assignee=assignee,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return service.list_tasks(filters)


@router.post("", response_model=TaskResponse, status_code=201, summary="Create task")
def create_task(
    data: TaskCreate,
    service: TaskService = Depends(_get_task_service),
    current_user=Depends(get_current_user),
):
    """Create a new task. The authenticated user becomes the creator."""
    return service.create_task(data, current_user)


@router.get("/{task_id}", response_model=TaskResponse, summary="Get task details")
def get_task(
    task_id: int,
    service: TaskService = Depends(_get_task_service),
    _current_user=Depends(get_current_user),
):
    """Return full task details including comments."""
    return service.get_task(task_id)


@router.put("/{task_id}", response_model=TaskResponse, summary="Update task")
def update_task(
    task_id: int,
    data: TaskUpdate,
    service: TaskService = Depends(_get_task_service),
    current_user=Depends(get_current_user),
):
    """Update any field on an existing task."""
    return service.update_task(task_id, data, current_user)


@router.delete("/{task_id}", status_code=204, summary="Delete task")
def delete_task(
    task_id: int,
    service: TaskService = Depends(_get_task_service),
    current_user=Depends(get_current_user),
):
    """Permanently delete a task and all its comments."""
    service.delete_task(task_id, current_user)


@router.get("/{task_id}/comments", response_model=List[CommentResponse], summary="List task comments")
def list_comments(
    task_id: int,
    service: CommentService = Depends(_get_comment_service),
    _current_user=Depends(get_current_user),
):
    """List comments for a task."""
    return service.list_by_task(task_id)


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=201, summary="Add comment")
def add_comment(
    task_id: int,
    data: CommentCreate,
    service: CommentService = Depends(_get_comment_service),
    current_user=Depends(get_current_user),
):
    """Add a comment/note to a task."""
    return service.create_comment(task_id, data, current_user)

@router.get("/{task_id}/activity", response_model=List[ActivityResponse], summary="List task activity")
def list_task_activity(
    task_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """List activity for a task."""
    from app.repositories.activity_repository import ActivityRepository
    repo = ActivityRepository(db)
    return repo.list_by_task(task_id)
