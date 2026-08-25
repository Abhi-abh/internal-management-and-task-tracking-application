from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import auth, dashboard, health, integrations, tasks, users, comments

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(tasks.router)
api_router.include_router(users.router)
api_router.include_router(dashboard.router)
api_router.include_router(integrations.router)
api_router.include_router(comments.router)
