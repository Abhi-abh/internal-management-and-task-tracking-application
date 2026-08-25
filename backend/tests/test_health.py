"""Tests for the /api/v1/health endpoint."""
from __future__ import annotations


def test_health_check_returns_200(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_check_response_body(client):
    response = client.get("/api/v1/health")
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data


def test_root_redirect(client):
    """Root / should return 200 with docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs" in data
