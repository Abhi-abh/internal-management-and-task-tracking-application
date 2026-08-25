import { useCallback, useEffect, useState } from 'react'
import dashboardService from '@/services/dashboardService'

/**
 * Hook to fetch dashboard statistics.
 * @returns {{ stats, loading, error, refetch }}
 */
export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard stats.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
