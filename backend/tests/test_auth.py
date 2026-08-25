from __future__ import annotations

def test_login_success(client, test_users):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "password_hash" not in data

def test_login_wrong_password(client, test_users):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401

def test_login_unknown_user(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "unknown@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 401

def test_login_missing_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        data={},
    )
    assert response.status_code == 422

def test_get_me_authenticated(client, auth_headers_member):
    response = client.get("/api/v1/auth/me", headers=auth_headers_member)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert data["email"] == "member@example.com"
    assert "password_hash" not in data
    assert "password" not in data

def test_get_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_invalid_token(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401
