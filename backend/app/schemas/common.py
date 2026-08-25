from __future__ import annotations

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Generic message envelope."""
    message: str


class PaginationMeta(BaseModel):
    """Pagination metadata returned with list endpoints."""
    total: int
    page: int
    page_size: int
    total_pages: int
