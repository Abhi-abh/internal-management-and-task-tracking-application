import { useState, useCallback, useEffect } from 'react'
import taskService from '@/services/taskService'

export function useTask(taskId) {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTask = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    setError(null)
    try {
      const data = await taskService.getTask(taskId)
      setTask(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('404')
      } else {
        setError(err.response?.data?.detail || 'Failed to load task')
      }
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  return { task, loading, error, refetch: fetchTask }
}
