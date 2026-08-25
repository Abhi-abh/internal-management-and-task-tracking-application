import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useTask } from '@/hooks/useTask'
import { useComments } from '@/hooks/useComments'
import { useActivity } from '@/hooks/useActivity'
import taskService from '@/services/taskService'

import TaskDetailHeader from '@/components/tasks/TaskDetailHeader'
import TaskInfo from '@/components/tasks/TaskInfo'
import ActivityTimeline from '@/components/tasks/ActivityTimeline'
import CommentList from '@/components/comments/CommentList'
import TaskModal from '@/components/tasks/TaskModal'

import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const toast = useToast()

  const { task, loading: taskLoading, error: taskError, refetch: refetchTask } = useTask(id)
  const { 
    comments, 
    loading: commentsLoading, 
    error: commentsError, 
    createComment, 
    updateComment, 
    deleteComment 
  } = useComments(id)
  
  const { 
    activity, 
    loading: activityLoading, 
    error: activityError, 
    refetch: refetchActivity 
  } = useActivity(id)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handlers for task mutations
  const handleUpdateTask = async (data) => {
    setIsSubmitting(true)
    try {
      await taskService.updateTask(id, data)
      toast.success('Task updated successfully')
      setIsEditModalOpen(false)
      await Promise.all([refetchTask(), refetchActivity()])
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async () => {
    setIsSubmitting(true)
    try {
      await taskService.deleteTask(id)
      toast.success('Task deleted successfully')
      navigate('/tasks')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete task')
    } finally {
      setIsSubmitting(false)
      setIsDeleteOpen(false)
    }
  }

  const handleCreateComment = async (text) => {
    try {
      await createComment(text)
      toast.success('Comment added successfully')
      refetchActivity()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to add comment')
    }
  }

  const handleUpdateComment = async (commentId, text) => {
    try {
      await updateComment(commentId, text)
      toast.success('Comment updated successfully')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId)
      toast.success('Comment deleted successfully')
      refetchActivity()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete comment')
    }
  }

  if (taskError === '404') {
    return (
      <EmptyState
        title="Task Not Found"
        description="This task may have been deleted or does not exist."
        action={
          <Button onClick={() => navigate('/tasks')} size="sm">
            Back to Tasks
          </Button>
        }
      />
    )
  }

  if (taskError) {
    return <ErrorState message={taskError} onRetry={refetchTask} />
  }

  if (taskLoading) {
    return <LoadingSpinner />
  }

  if (!task) return null

  // Ensure authorization logic checks roles if necessary
  const canEditOrDelete = user?.role === 'admin' || user?.role === 'manager' || user?.id === task.created_by

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <TaskDetailHeader 
        task={task} 
        onEdit={() => setIsEditModalOpen(true)} 
        onDelete={() => setIsDeleteOpen(true)} 
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <TaskInfo task={task} />

          {/* Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Comments</h2>
            <CommentList 
              comments={comments} 
              loading={commentsLoading} 
              error={commentsError} 
              currentUser={user} 
              onCreate={handleCreateComment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          </div>
        </div>

        {/* Sidebar / Timeline Area */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Activity History</h2>
            <ActivityTimeline activity={activity} loading={activityLoading} error={activityError} />
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={task}
        onSubmit={handleUpdateTask}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTask}
        loading={isSubmitting}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </div>
  )
}
