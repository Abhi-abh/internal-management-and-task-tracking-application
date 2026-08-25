from __future__ import annotations
import pytest
import httpx

def test_weather_integration_success(client, auth_headers_admin, mocker):
    mock_response = {"temperature": 20, "condition": "Sunny"}
    
    # We mock the WeatherClient get_current_weather method directly
    mocker.patch(
        "app.integrations.weather_client.weather_client.get_current_weather",
        return_value=mock_response
    )
    
    res = client.get("/api/v1/integrations/weather", headers=auth_headers_admin)
    assert res.status_code == 200
    assert res.json() == mock_response

def test_weather_integration_failure(client, auth_headers_admin, mocker):
    mocker.patch(
        "app.integrations.weather_client.weather_client.get_current_weather",
        side_effect=httpx.TimeoutException("Timeout")
    )
    
    res = client.get("/api/v1/integrations/weather", headers=auth_headers_admin)
    assert res.status_code == 502
    assert "Timeout" in res.json()["detail"]
