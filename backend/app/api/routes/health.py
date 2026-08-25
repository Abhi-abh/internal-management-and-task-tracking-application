from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health check")
async def health_check():
    """
    Simple liveness probe.
    Returns 200 OK when the service is running.
    """
    return {"status": "ok", "service": "Task Management Dashboard API"}
