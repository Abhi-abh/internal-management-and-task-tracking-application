import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTasks } from '@/hooks/useTasks'
import { useAuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDebounce } from '@/hooks/useDebounce'
import TaskTable from '@/components/tasks/TaskTable'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskModal from '@/components/tasks/TaskModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function Tasks() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const toast = useToast()

  const [searchParams, setSearchParams] = useSearchParams()

  // Extract filters from URL
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const urlAssignee = searchParams.get('assignee') || ''
  const sortBy = searchParams.get('sort_by') || 'created_at'
  const sortOrder = searchParams.get('sort_order') || 'desc'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  // Resolve assignee=me
  const resolvedAssignee = useMemo(() => {
    if (urlAssignee === 'me' && user) return String(user.id)
    return urlAssignee
  }, [urlAssignee, user])

  const debouncedSearch = useDebounce(search, 400)

  // Data fetching
  const filters = useMemo(() => {
    return {
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
      assignee: resolvedAssignee || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit,
    }
  }, [debouncedSearch, status, priority, resolvedAssignee, sortBy, sortOrder, page, limit])

  const { tasks, total, total_pages, loading, error, refetch, createTask, updateTask, deleteTask } = useTasks(filters)

  // Handlers for URL params
  const updateParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      } else {
        nextParams.delete(key)
      }
    })
    setSearchParams(nextParams, { replace: true })
  }

  const handleSearchChange = (e) => {
    updateParams({ search: e.target.value, page: '1' })
  }

  const handleFilterChange = (key, value) => {
    updateParams({ [key]: value, page: '1' })
  }

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc'
    updateParams({ sort_by: field, sort_order: isAsc ? 'desc' : 'asc', page: '1' })
  }

  const handlePageChange = (newPage) => {
    updateParams({ page: String(newPage) })
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams({ limit: String(limit) }), { replace: true })
  }

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateModal = () => {
    setTaskToEdit(null)
    setIsModalOpen(true)
  }

  const openEditModal = (task) => {
    setTaskToEdit(task)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setTaskToEdit(null)
  }

  // Mutations
  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, data)
        toast.success('Task updated successfully')
      } else {
        await createTask(data)
        toast.success('Task created successfully')
      }
      handleModalClose()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return
    setIsSubmitting(true)
    try {
      await deleteTask(taskToDelete.id)
      toast.success('Task deleted successfully')
      setTaskToDelete(null)
      // Check if we need to decrement page
      if (tasks.length === 1 && page > 1) {
        updateParams({ page: String(page - 1) })
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete task')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">
            {loading ? 'Loading…' : `${total || 0} task${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Button onClick={openCreateModal} size="md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </Button>
      </div>

      <TaskFilters
        search={search}
        status={status}
        priority={priority}
        assignee={urlAssignee}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {loading && !tasks.length ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            search || status || priority || urlAssignee
              ? 'Try adjusting your filters.'
              : 'Create your first task to get started.'
          }
          action={
            <Button onClick={openCreateModal} size="sm">
              Create Task
            </Button>
          }
        />
      ) : (
        <TaskTable
          tasks={tasks}
          loading={loading}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onEdit={openEditModal}
          onDelete={setTaskToDelete}
        />
      )}

      {total_pages > 1 && (
        <Pagination page={page} totalPages={total_pages} onPageChange={handlePageChange} loading={loading} />
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={taskToEdit}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={!!taskToDelete}
        onClose={() => !isSubmitting && setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={isSubmitting}
      />
    </div>
  )
}
