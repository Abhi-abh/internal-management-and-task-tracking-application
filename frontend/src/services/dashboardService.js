import api from './api'

const dashboardService = {
  /**
   * Fetch aggregate task statistics for the dashboard.
   * @returns {{ total_tasks: number, by_status: object, by_priority: object }}
   */
  async getStats() {
    const response = await api.get('/dashboard')
    return response.data
  },
}

export default dashboardService
