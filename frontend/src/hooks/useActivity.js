import { useState, useCallback, useEffect } from 'react'
import activityService from '@/services/activityService'

export function useActivity(taskId) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchActivity = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    setError(null)
    try {
      const data = await activityService.getActivityByTask(taskId)
      setActivity(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  return { activity, loading, error, refetch: fetchActivity }
}
