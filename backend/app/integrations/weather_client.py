from __future__ import annotations

from typing import Any

import httpx

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1"


class WeatherClient:
    """
    External API integration using Open-Meteo (https://open-meteo.com/).
    Free weather API — no API key required.
    """

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(base_url=OPEN_METEO_BASE_URL, timeout=10.0)

    async def get_current_weather(
        self,
        latitude: float = 40.7128,
        longitude: float = -74.0060,
    ) -> dict[str, Any]:
        """
        Fetch current weather conditions for a given location.
        Defaults to New York City coordinates.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "temperature_unit": "celsius",
            "wind_speed_unit": "kmh",
            "timezone": "auto",
        }
        response = await self._client.get("/forecast", params=params)
        response.raise_for_status()
        return response.json()

    async def close(self) -> None:
        await self._client.aclose()


# Module-level singleton
weather_client = WeatherClient()
