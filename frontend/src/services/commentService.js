import api from './api'

const commentService = {
  async getCommentsByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/comments`)
    return response.data
  },

  async createComment(taskId, data) {
    // schema expects { comment: string }
    const response = await api.post(`/tasks/${taskId}/comments`, data)
    return response.data
  },

  async updateComment(commentId, data) {
    const response = await api.put(`/comments/${commentId}`, data)
    return response.data
  },

  async deleteComment(commentId) {
    await api.delete(`/comments/${commentId}`)
  }
}

export default commentService
