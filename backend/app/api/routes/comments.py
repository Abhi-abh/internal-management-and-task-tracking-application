from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.schemas.comment import CommentResponse, CommentUpdate
from app.services.comment_service import CommentService

router = APIRouter(prefix="/comments", tags=["Comments"])

def _get_comment_service(db: Session = Depends(get_db)) -> CommentService:
    return CommentService(db)

@router.put("/{comment_id}", response_model=CommentResponse, summary="Update comment")
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    service: CommentService = Depends(_get_comment_service),
    current_user=Depends(get_current_user),
):
    """Update an existing comment."""
    return service.update_comment(comment_id, data, current_user)


@router.delete("/{comment_id}", status_code=204, summary="Delete comment")
def delete_comment(
    comment_id: int,
    service: CommentService = Depends(_get_comment_service),
    current_user=Depends(get_current_user),
):
    """Delete a comment."""
    service.delete_comment(comment_id, current_user)
