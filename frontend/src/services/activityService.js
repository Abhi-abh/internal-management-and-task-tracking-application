import api from './api'

const activityService = {
  async getActivityByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/activity`)
    return response.data
  }
}

export default activityService
