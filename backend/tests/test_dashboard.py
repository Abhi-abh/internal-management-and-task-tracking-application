from __future__ import annotations
import pytest
from datetime import datetime, timedelta, timezone
from app.models.task import Task
from app.models.enums import TaskStatus, TaskPriority

def test_dashboard_stats(client, auth_headers_admin, db_session, test_users):
    now = datetime.now(timezone.utc)
    
    t1 = Task(title="T1", status=TaskStatus.PENDING, priority=TaskPriority.LOW, created_by=test_users["admin"].id, assigned_to=test_users["admin"].id, due_date=now - timedelta(days=1))
    t2 = Task(title="T2", status=TaskStatus.IN_PROGRESS, priority=TaskPriority.MEDIUM, created_by=test_users["manager"].id, assigned_to=test_users["admin"].id, due_date=now + timedelta(days=1))
    t3 = Task(title="T3", status=TaskStatus.COMPLETED, priority=TaskPriority.HIGH, created_by=test_users["admin"].id, assigned_to=test_users["member"].id, due_date=now - timedelta(days=2))
    t4 = Task(title="T4", status=TaskStatus.BLOCKED, priority=TaskPriority.URGENT, created_by=test_users["admin"].id, assigned_to=None, due_date=now + timedelta(days=2))
    
    db_session.add_all([t1, t2, t3, t4])
    db_session.commit()

    res = client.get("/api/v1/dashboard", headers=auth_headers_admin)
    assert res.status_code == 200
    data = res.json()

    assert data["total_tasks"] == 4
    assert data["pending_tasks"] == 1
    assert data["in_progress_tasks"] == 1
    assert data["completed_tasks"] == 1
    assert data["blocked_tasks"] == 1
    
    # Overdue should only count T1, because T3 is completed
    assert data["overdue_tasks"] == 1
    
    # Current user tasks for Admin should be 2 (T1, T2)
    assert data["current_user_tasks"] == 2
