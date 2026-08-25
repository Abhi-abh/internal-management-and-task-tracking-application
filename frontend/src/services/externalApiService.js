/**
 * External API service — wraps the backend's weather integration proxy.
 * The backend calls Open-Meteo and we surface the result here.
 */
import api from './api'

const externalApiService = {
  /**
   * Fetch current weather data via the backend proxy.
   * @param {{ latitude?: number, longitude?: number }} params
   */
  async getWeather(params = {}) {
    const response = await api.get('/integrations/weather', { params })
    return response.data
  },
}

export default externalApiService
