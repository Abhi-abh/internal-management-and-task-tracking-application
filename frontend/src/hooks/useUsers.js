import { useState, useCallback, useEffect } from 'react'
import userService from '@/services/userService'

export function useUsers(initialParams = {}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  })

  // Destructure for memoization
  const page = initialParams.page || 1
  const limit = initialParams.limit || 20
  const search = initialParams.search || ''
  const role = initialParams.role || ''

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (search) params.search = search
      if (role) params.role = role

      const data = await userService.getUsers(params)
      setUsers(data.items)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        total_pages: data.total_pages
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, role])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = async (data) => {
    await userService.createUser(data)
    await fetchUsers()
  }

  const updateUser = async (id, data) => {
    await userService.updateUser(id, data)
    await fetchUsers()
  }

  const deleteUser = async (id) => {
    await userService.deleteUser(id)
    await fetchUsers()
  }

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
