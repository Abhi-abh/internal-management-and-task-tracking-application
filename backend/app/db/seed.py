import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

# Add the parent directory to sys.path so we can import 'app'
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.base import SessionLocal
from app.models.user import User
from app.models.task import Task
from app.models.comment import Comment
from app.models.activity import TaskActivity
from app.models.enums import UserRole, TaskStatus, TaskPriority
from app.core.security import hash_password

def seed_db():
    db: Session = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping...")
            return

        print("Seeding Users...")
        admin = User(name="Admin User", email="admin@example.com", password_hash=hash_password("admin123"), role=UserRole.ADMIN)
        manager = User(name="Manager User", email="manager@example.com", password_hash=hash_password("manager123"), role=UserRole.MANAGER)
        member1 = User(name="Alice", email="alice@example.com", password_hash=hash_password("member123"), role=UserRole.MEMBER)
        member2 = User(name="Bob", email="bob@example.com", password_hash=hash_password("member123"), role=UserRole.MEMBER)
        member3 = User(name="Charlie", email="charlie@example.com", password_hash=hash_password("member123"), role=UserRole.MEMBER)

        db.add_all([admin, manager, member1, member2, member3])
        db.commit()
        
        users = [admin, manager, member1, member2, member3]
        for u in users:
            db.refresh(u)

        print("Seeding Tasks...")
        now = datetime.now(timezone.utc)
        
        tasks_data = [
            # 1. Pending, Low
            {"title": "Setup development environment", "description": "Install Python and Node.js", "status": TaskStatus.PENDING, "priority": TaskPriority.LOW, "created_by": admin.id, "assigned_to": member1.id, "due_date": now + timedelta(days=5)},
            # 2. In Progress, Medium
            {"title": "Design Database Schema", "description": "Draw ER diagrams for the new feature", "status": TaskStatus.IN_PROGRESS, "priority": TaskPriority.MEDIUM, "created_by": manager.id, "assigned_to": member2.id, "due_date": now + timedelta(days=2)},
            # 3. Completed, High
            {"title": "Fix login bug", "description": "Users can't login on Safari", "status": TaskStatus.COMPLETED, "priority": TaskPriority.HIGH, "created_by": admin.id, "assigned_to": member1.id, "due_date": now - timedelta(days=1)},
            # 4. Blocked, Urgent
            {"title": "Deploy to production", "description": "Waiting for CI/CD approval", "status": TaskStatus.BLOCKED, "priority": TaskPriority.URGENT, "created_by": manager.id, "assigned_to": admin.id, "due_date": now + timedelta(days=1)},
            # 5. Overdue (Pending)
            {"title": "Write monthly report", "description": "Summarize team metrics", "status": TaskStatus.PENDING, "priority": TaskPriority.MEDIUM, "created_by": manager.id, "assigned_to": manager.id, "due_date": now - timedelta(days=3)},
            # 6. Future, Low
            {"title": "Update README", "description": "Add new API endpoints documentation", "status": TaskStatus.PENDING, "priority": TaskPriority.LOW, "created_by": member1.id, "assigned_to": member3.id, "due_date": now + timedelta(days=14)},
            # 7. In Progress, Urgent
            {"title": "Hotfix memory leak", "description": "App crashes after 2 hours", "status": TaskStatus.IN_PROGRESS, "priority": TaskPriority.URGENT, "created_by": admin.id, "assigned_to": member2.id, "due_date": now + timedelta(hours=4)},
            # 8. Unassigned
            {"title": "Brainstorming session", "description": "Think of new ideas", "status": TaskStatus.PENDING, "priority": TaskPriority.LOW, "created_by": manager.id, "assigned_to": None, "due_date": now + timedelta(days=7)},
            # 9. Blocked, High
            {"title": "Third-party integration", "description": "Waiting on external API key", "status": TaskStatus.BLOCKED, "priority": TaskPriority.HIGH, "created_by": admin.id, "assigned_to": member1.id, "due_date": now + timedelta(days=2)},
            # 10. Completed, Low
            {"title": "Clean up old branches", "description": "Remove merged branches from remote", "status": TaskStatus.COMPLETED, "priority": TaskPriority.LOW, "created_by": member3.id, "assigned_to": member3.id, "due_date": now - timedelta(days=5)},
        ]

        tasks = []
        for t_data in tasks_data:
            t = Task(**t_data)
            db.add(t)
            tasks.append(t)
        
        db.commit()
        
        for t in tasks:
            db.refresh(t)
            # Create activity for task created
            db.add(TaskActivity(task_id=t.id, user_id=t.created_by, action="task_created"))

        print("Seeding Comments and Activities...")
        # Add some comments
        c1 = Comment(task_id=tasks[1].id, user_id=member2.id, comment="I started working on this. Schema looks good.")
        c2 = Comment(task_id=tasks[1].id, user_id=manager.id, comment="Great, let me know if you need review.")
        c3 = Comment(task_id=tasks[3].id, user_id=admin.id, comment="Still blocked by infrastructure team.")
        db.add_all([c1, c2, c3])
        
        # Add activities for comments
        db.add(TaskActivity(task_id=tasks[1].id, user_id=member2.id, action="comment_added"))
        db.add(TaskActivity(task_id=tasks[1].id, user_id=manager.id, action="comment_added"))
        db.add(TaskActivity(task_id=tasks[3].id, user_id=admin.id, action="comment_added"))
        
        # Add some mock status changes
        db.add(TaskActivity(task_id=tasks[2].id, user_id=member1.id, action="status_changed", old_value=TaskStatus.IN_PROGRESS.value, new_value=TaskStatus.COMPLETED.value))
        db.add(TaskActivity(task_id=tasks[3].id, user_id=manager.id, action="status_changed", old_value=TaskStatus.IN_PROGRESS.value, new_value=TaskStatus.BLOCKED.value))
        
        db.commit()
        print("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
