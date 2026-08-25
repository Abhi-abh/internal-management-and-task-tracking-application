import { useState, useCallback, useEffect } from 'react'
import commentService from '@/services/commentService'

export function useComments(taskId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    setError(null)
    try {
      const data = await commentService.getCommentsByTask(taskId)
      setComments(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const createComment = useCallback(async (text) => {
    await commentService.createComment(taskId, { comment: text })
    await fetchComments()
  }, [taskId, fetchComments])

  const updateComment = useCallback(async (commentId, text) => {
    await commentService.updateComment(commentId, { comment: text })
    await fetchComments()
  }, [fetchComments])

  const deleteComment = useCallback(async (commentId) => {
    await commentService.deleteComment(commentId)
    await fetchComments()
  }, [fetchComments])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { 
    comments, 
    loading, 
    error, 
    refetch: fetchComments, 
    createComment, 
    updateComment, 
    deleteComment 
  }
}
