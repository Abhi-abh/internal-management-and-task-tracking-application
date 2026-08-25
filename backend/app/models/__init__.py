# Re-export all models so that init_db and Alembic can discover them
from app.models.enums import TaskPriority, TaskStatus, UserRole
from app.models.user import User
from app.models.task import Task
from app.models.comment import Comment
from app.models.activity import TaskActivity

__all__ = ["User", "Task", "Comment", "TaskActivity", "TaskStatus", "TaskPriority", "UserRole"]
