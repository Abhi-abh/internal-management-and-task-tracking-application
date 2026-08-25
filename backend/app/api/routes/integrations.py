from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user
from app.integrations.weather_client import weather_client

router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.get("/weather", summary="Current weather (Open-Meteo)")
async def get_weather(
    latitude: float = Query(default=40.7128, description="Latitude (default: New York City)"),
    longitude: float = Query(default=-74.0060, description="Longitude"),
    _current_user=Depends(get_current_user),
):
    """
    Fetch current weather conditions from Open-Meteo (free, no API key required).
    Demonstrates external API integration pattern.
    """
    try:
        data = await weather_client.get_current_weather(
            latitude=latitude, longitude=longitude
        )
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"External weather API error: {exc}",
        )
