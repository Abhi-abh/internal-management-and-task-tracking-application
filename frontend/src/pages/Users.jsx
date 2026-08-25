import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/context/ToastContext'
import { useAuthContext } from '@/context/AuthContext'
import { useUsers } from '@/hooks/useUsers'

import UserFilters from '@/components/users/UserFilters'
import UserTable from '@/components/users/UserTable'
import UserModal from '@/components/users/UserModal'
import Pagination from '@/components/ui/Pagination'

import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user: currentUser } = useAuthContext()
  const toast = useToast()

  // Parse URL state
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''

  // Setup hooks
  const { 
    users, 
    loading, 
    error, 
    pagination, 
    refetch, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useUsers({ page, limit, search, role })

  // Local component state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const hasFilters = search !== '' || role !== ''

  // Handlers for URL updating
  const updateUrl = useCallback((updates) => {
    setSearchParams((prev) => {
      const current = Object.fromEntries(prev)
      const next = { ...current, ...updates }
      
      // Clean up empty filters
      Object.keys(next).forEach(key => {
        if (next[key] === '' || next[key] === null || next[key] === undefined) {
          delete next[key]
        }
      })
      
      return next
    })
  }, [setSearchParams])

  const handleFilterChange = useCallback((filters) => {
    updateUrl({ ...filters, page: 1 })
  }, [updateUrl])

  const handlePageChange = useCallback((newPage) => {
    updateUrl({ page: newPage })
  }, [updateUrl])

  const handleCreateClick = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (userToEdit) => {
    setEditingUser(userToEdit)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (user) => {
    if (user.id === currentUser?.id) {
      toast.error('You cannot delete your own account.')
      return
    }
    setUserToDelete(user)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    setIsSubmitting(true)
    try {
      await deleteUser(userToDelete.id)
      toast.success('User deleted successfully')
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error('This user cannot be deleted because they are assigned to existing tasks. Consider deactivating instead if supported.')
      } else {
        toast.error(err?.response?.data?.detail || 'Failed to delete user')
      }
    } finally {
      setIsSubmitting(false)
      setUserToDelete(null)
    }
  }

  const handleModalSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data)
        toast.success('User updated successfully')
      } else {
        await createUser(data)
        toast.success('User created successfully')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Operation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canCreate = currentUser?.role === 'admin'

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members, roles, and access.</p>
        </div>
        {canCreate && (
          <Button onClick={handleCreateClick} className="w-full sm:w-auto shrink-0">
            Create User
          </Button>
        )}
      </div>

      <UserFilters 
        initialSearch={search} 
        initialRole={role} 
        onFilterChange={handleFilterChange} 
      />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No users match your filters" : "No users found"}
          description={hasFilters ? "Try adjusting your search terms or role filters." : "Get started by creating a new team member."}
          action={
            hasFilters 
              ? <Button variant="secondary" onClick={() => handleFilterChange({ search: '', role: '' })}>Clear Filters</Button>
              : (canCreate && <Button onClick={handleCreateClick}>Create User</Button>)
          }
        />
      ) : (
        <>
          <UserTable 
            users={users} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
            currentUser={currentUser}
          />
          
          {pagination.total_pages > 1 && (
            <Pagination 
              page={pagination.page} 
              totalPages={pagination.total_pages} 
              onPageChange={handlePageChange} 
              loading={loading}
            />
          )}
        </>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingUser}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />
      
      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        loading={isSubmitting}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete User"
      />
    </div>
  )
}
