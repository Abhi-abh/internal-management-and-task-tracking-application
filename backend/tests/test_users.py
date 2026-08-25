from __future__ import annotations

def test_list_users_admin(client, auth_headers_admin):
    response = client.get("/api/v1/users", headers=auth_headers_admin)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert "password_hash" not in data["items"][0]

def test_list_users_unauthorized(client):
    response = client.get("/api/v1/users")
    assert response.status_code == 401

def test_get_user(client, auth_headers_manager, test_users):
    user_id = test_users["member"].id
    response = client.get(f"/api/v1/users/{user_id}", headers=auth_headers_manager)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "member@example.com"
    assert "password_hash" not in data

def test_get_nonexistent_user(client, auth_headers_admin):
    response = client.get("/api/v1/users/999", headers=auth_headers_admin)
    assert response.status_code == 404

def test_update_user(client, auth_headers_admin, test_users):
    user_id = test_users["member"].id
    response = client.put(
        f"/api/v1/users/{user_id}",
        headers=auth_headers_admin,
        json={"name": "Updated Member"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Member"

def test_update_user_duplicate_email(client, auth_headers_admin, test_users):
    user_id = test_users["member"].id
    # Attempt to change member email to manager email
    response = client.put(
        f"/api/v1/users/{user_id}",
        headers=auth_headers_admin,
        json={"email": test_users["manager"].email}
    )
    assert response.status_code == 409

def test_delete_user(client, auth_headers_admin, test_users):
    # Member has no tasks currently
    user_id = test_users["member"].id
    response = client.delete(f"/api/v1/users/{user_id}", headers=auth_headers_admin)
    assert response.status_code == 204
    
    # Verify user is deleted
    response = client.get(f"/api/v1/users/{user_id}", headers=auth_headers_admin)
    assert response.status_code == 404

def test_delete_user_with_tasks(client, auth_headers_admin, test_users, db_session):
    # Assign a task to the manager
    from app.models.task import Task
    from app.models.enums import TaskStatus, TaskPriority
    
    manager_id = test_users["manager"].id
    task = Task(title="Test", status=TaskStatus.PENDING, priority=TaskPriority.LOW, created_by=manager_id)
    db_session.add(task)
    db_session.commit()
    
    # Attempt to delete manager
    response = client.delete(f"/api/v1/users/{manager_id}", headers=auth_headers_admin)
    
    # Should return 409 Conflict
    assert response.status_code == 409
    
    # Verify manager still exists
    response = client.get(f"/api/v1/users/{manager_id}", headers=auth_headers_admin)
    assert response.status_code == 200

def test_delete_self(client, auth_headers_admin, test_users):
    admin_id = test_users["admin"].id
    response = client.delete(f"/api/v1/users/{admin_id}", headers=auth_headers_admin)
    assert response.status_code == 403
