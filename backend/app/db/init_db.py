from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.db.base import Base, engine

logger = logging.getLogger(__name__)


def init_db() -> None:
    """
    Create all tables based on registered models.

    This is a convenience helper for development and testing.
    In production, use Alembic migrations (`alembic upgrade head`).
    """
    # Import models so SQLAlchemy registers them with Base.metadata
    import app.models  # noqa: F401

    logger.info("Creating database tables (if they do not exist)…")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")
