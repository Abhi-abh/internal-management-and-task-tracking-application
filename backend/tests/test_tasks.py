from __future__ import annotations
import pytest
from app.models.task import Task
from app.models.enums import TaskStatus, TaskPriority

def test_create_task_success(client, auth_headers_admin):
    payload = {
        "title": "New Task",
        "description": "Task description",
        "status": "pending",
        "priority": "high",
        "due_date": "2026-12-31T23:59:59Z",
    }
    response = client.post("/api/v1/tasks", json=payload, headers=auth_headers_admin)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Task"
    assert data["status"] == "pending"
    assert data["priority"] == "high"

def test_create_task_missing_title(client, auth_headers_admin):
    payload = {
        "description": "No title",
        "status": "pending",
        "priority": "high",
    }
    response = client.post("/api/v1/tasks", json=payload, headers=auth_headers_admin)
    assert response.status_code == 422

def test_create_task_invalid_status(client, auth_headers_admin):
    payload = {
        "title": "Invalid status",
        "status": "invalid_status",
    }
    response = client.post("/api/v1/tasks", json=payload, headers=auth_headers_admin)
    assert response.status_code == 422

def test_get_tasks(client, auth_headers_admin, db_session, test_users):
    # Seed tasks
    t1 = Task(title="Shopify integration", description="Shopify API", status=TaskStatus.PENDING, priority=TaskPriority.HIGH, created_by=test_users["admin"].id, assigned_to=test_users["member"].id)
    t2 = Task(title="React frontend", description="UI design", status=TaskStatus.IN_PROGRESS, priority=TaskPriority.MEDIUM, created_by=test_users["admin"].id, assigned_to=test_users["manager"].id)
    db_session.add_all([t1, t2])
    db_session.commit()

    # Search case-insensitive
    res = client.get("/api/v1/tasks?search=SHOPIFY", headers=auth_headers_admin)
    assert res.status_code == 200
    assert len(res.json()["items"]) == 1
    assert res.json()["items"][0]["title"] == "Shopify integration"

    # Filter status & priority
    res = client.get("/api/v1/tasks?status=in_progress&priority=medium", headers=auth_headers_admin)
    assert len(res.json()["items"]) == 1
    assert res.json()["items"][0]["title"] == "React frontend"

    # Filter assignee
    res = client.get(f"/api/v1/tasks?assignee={test_users['member'].id}", headers=auth_headers_admin)
    assert len(res.json()["items"]) == 1

def test_pagination(client, auth_headers_admin, db_session, test_users):
    # Seed 15 tasks
    tasks = [Task(title=f"Task {i}", status=TaskStatus.PENDING, priority=TaskPriority.LOW, created_by=test_users["admin"].id) for i in range(15)]
    db_session.add_all(tasks)
    db_session.commit()

    # Get page 1 limit 5
    res = client.get("/api/v1/tasks?page=1&limit=5", headers=auth_headers_admin)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 5
    assert data["page"] == 1
    assert data["limit"] == 5
    assert data["total"] >= 15
    assert data["total_pages"] >= 3

    # Invalid pagination
    res = client.get("/api/v1/tasks?page=0&limit=5", headers=auth_headers_admin)
    assert res.status_code == 422
    res = client.get("/api/v1/tasks?page=1&limit=0", headers=auth_headers_admin)
    assert res.status_code == 422
    res = client.get("/api/v1/tasks?page=1&limit=101", headers=auth_headers_admin)
    assert res.status_code == 422

def test_update_task(client, auth_headers_admin, db_session, test_users):
    t = Task(title="Old Title", status=TaskStatus.PENDING, priority=TaskPriority.LOW, created_by=test_users["admin"].id)
    db_session.add(t)
    db_session.commit()

    res = client.put(f"/api/v1/tasks/{t.id}", json={"title": "New Title", "status": "completed"}, headers=auth_headers_admin)
    assert res.status_code == 200
    assert res.json()["title"] == "New Title"
    assert res.json()["status"] == "completed"

def test_delete_task(client, auth_headers_admin, db_session, test_users):
    t = Task(title="To Delete", status=TaskStatus.PENDING, priority=TaskPriority.LOW, created_by=test_users["admin"].id)
    db_session.add(t)
    db_session.commit()

    res = client.delete(f"/api/v1/tasks/{t.id}", headers=auth_headers_admin)
    assert res.status_code == 204

    res = client.get(f"/api/v1/tasks/{t.id}", headers=auth_headers_admin)
    assert res.status_code == 404

def test_transaction_rollback_on_task_create(client, auth_headers_admin, mocker):
    # Mock activity_repo.create to raise an exception
    mocker.patch("app.repositories.activity_repository.ActivityRepository.create", side_effect=Exception("DB Error"))
    
    payload = {
        "title": "Rollback Task",
    }
    # This should return 500
    with pytest.raises(Exception):
        client.post("/api/v1/tasks", json=payload, headers=auth_headers_admin)
        
    # Check that task was NOT created
    res = client.get("/api/v1/tasks?search=Rollback Task", headers=auth_headers_admin)
    assert len(res.json()["items"]) == 0
