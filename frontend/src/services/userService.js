import api from './api'

const userService = {
  /**
   * Fetch paginated list of users.
   * @param {{ page?: number, page_size?: number }} params
   */
  async getUsers(params = {}) {
    const response = await api.get('/users', { params })
    return response.data
  },

  /**
   * Fetch a user by ID.
   * @param {number} userId
   */
  async getUser(userId) {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  /**
   * Update a user's profile.
   * @param {number} userId
   * @param {object} data
   */
  async updateUser(userId, data) {
    const response = await api.put(`/users/${userId}`, data)
    return response.data
  },
  /**
   * Create a new user.
   * @param {object} data 
   */
  async createUser(data) {
    const response = await api.post('/users', data)
    return response.data
  },

  /**
   * Delete a user.
   * @param {number} userId 
   */
  async deleteUser(userId) {
    await api.delete(`/users/${userId}`)
  },
}

export default userService
