import api from './api'

const taskService = {
  /**
   * Fetch a paginated, filtered list of tasks.
   * @param {object} params - Filter/sort/pagination params
   */
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params })
    return response.data
  },

  /**
   * Fetch a single task by ID (includes comments).
   * @param {number} taskId
   */
  async getTask(taskId) {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  /**
   * Create a new task.
   * @param {object} data - TaskCreate payload
   */
  async createTask(data) {
    const response = await api.post('/tasks', data)
    return response.data
  },

  /**
   * Update a task.
   * @param {number} taskId
   * @param {object} data - TaskUpdate payload (partial)
   */
  async updateTask(taskId, data) {
    const response = await api.put(`/tasks/${taskId}`, data)
    return response.data
  },

  /**
   * Delete a task permanently.
   * @param {number} taskId
   */
  async deleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`)
  },

}

export default taskService
