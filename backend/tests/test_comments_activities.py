from __future__ import annotations
import pytest
from app.models.task import Task
from app.models.enums import TaskStatus, TaskPriority
from app.models.comment import Comment

def test_activity_logging(client, auth_headers_admin, db_session, test_users):
    # Create Task
    res = client.post("/api/v1/tasks", json={"title": "Activity Test", "status": "pending"}, headers=auth_headers_admin)
    assert res.status_code == 201
    task_id = res.json()["id"]

    # Change status and priority
    res = client.put(f"/api/v1/tasks/{task_id}", json={"status": "in_progress", "priority": "high"}, headers=auth_headers_admin)
    assert res.status_code == 200

    # Add comment
    res = client.post(f"/api/v1/tasks/{task_id}/comments", json={"content": "New comment"}, headers=auth_headers_admin)
    assert res.status_code == 201

    # Fetch activities
    res = client.get(f"/api/v1/tasks/{task_id}/activity", headers=auth_headers_admin)
    assert res.status_code == 200
    activities = res.json()
    
    actions = [a["action"] for a in activities]
    # Ordered desc by default
    assert "comment_added" in actions
    assert "status_changed" in actions
    assert "priority_changed" in actions
    assert "task_created" in actions

    # Verify old_value and new_value for status
    status_activity = next(a for a in activities if a["action"] == "status_changed")
    assert status_activity["old_value"] == "pending"
    assert status_activity["new_value"] == "in_progress"

def test_comment_authorization(client, auth_headers_admin, auth_headers_member, db_session, test_users):
    t = Task(title="Comment Test", status=TaskStatus.PENDING, priority=TaskPriority.LOW, created_by=test_users["admin"].id)
    db_session.add(t)
    db_session.commit()

    # Member creates comment
    res = client.post(f"/api/v1/tasks/{t.id}/comments", json={"content": "Member comment"}, headers=auth_headers_member)
    assert res.status_code == 201
    comment_id = res.json()["id"]

    # Member updates own comment
    res = client.put(f"/api/v1/comments/{comment_id}", json={"content": "Member comment updated"}, headers=auth_headers_member)
    assert res.status_code == 200

    # Admin updates member comment
    res = client.put(f"/api/v1/comments/{comment_id}", json={"content": "Admin override"}, headers=auth_headers_admin)
    assert res.status_code == 200

    # Another member (if existed) would be 403, but let's test a manager updating member's comment. 
    # Current CommentService logic: "if comment.user_id != current_user.id and current_user.role != 'admin': raise 403"
    # So a manager gets 403. Let's create auth_headers_manager and verify
    # (assuming manager auth is available)
    # response = client.put(f"/api/v1/comments/{comment_id}", json={"content": "Manager edit"}, headers=auth_headers_manager)
    # assert response.status_code == 403

    # Member deletes own comment
    res = client.delete(f"/api/v1/comments/{comment_id}", headers=auth_headers_member)
    # But wait, admin already updated it, the user_id is still member's. 
    assert res.status_code == 204
