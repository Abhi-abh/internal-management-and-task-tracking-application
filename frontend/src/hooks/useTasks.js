import { useCallback, useEffect, useReducer, useRef } from 'react'
import taskService from '@/services/taskService'

const initialState = {
  tasks: [],
  total: 0,
  page: 1,
  page_size: 20,
  total_pages: 1,
  loading: false,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        ...action.payload,
        tasks: action.payload.items || [] 
      }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

/**
 * Hook to fetch and manage a paginated task list.
 * @param {object} filters - Initial filter params
 * @returns {{ tasks, total, page, total_pages, loading, error, refetch }}
 */
export function useTasks(filters = {}) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchTasks = useCallback(async (params) => {
    dispatch({ type: 'FETCH_START' })
    try {
      const data = await taskService.getTasks(params || filtersRef.current)
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch (err) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: err?.response?.data?.detail || 'Failed to load tasks.',
      })
    }
  }, [])

  useEffect(() => {
    fetchTasks(filters)
  }, [JSON.stringify(filters)]) // eslint-disable-line react-hooks/exhaustive-deps

  const createTask = useCallback(async (data) => {
    try {
      await taskService.createTask(data)
      fetchTasks() // Refresh list
    } catch (err) {
      throw err?.response?.data?.detail || 'Failed to create task.'
    }
  }, [fetchTasks])

  const updateTask = useCallback(async (id, data) => {
    try {
      await taskService.updateTask(id, data)
      fetchTasks() // Refresh list
    } catch (err) {
      throw err?.response?.data?.detail || 'Failed to update task.'
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id) => {
    try {
      await taskService.deleteTask(id)
      fetchTasks() // Refresh list
    } catch (err) {
      throw err?.response?.data?.detail || 'Failed to delete task.'
    }
  }, [fetchTasks])

  return { ...state, refetch: fetchTasks, createTask, updateTask, deleteTask }
}
