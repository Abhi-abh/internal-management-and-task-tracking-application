import { useState } from 'react'
import { formatRelativeTime } from '@/utils/formatters'
import { getInitials } from '@/utils/helpers'
import CommentForm from './CommentForm'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function CommentItem({ comment, currentUser, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Authorization check (backend handles actual security)
  const canEditOrDelete = currentUser?.role === 'admin' || currentUser?.id === comment.user_id

  const handleUpdate = async (text) => {
    setSubmitting(true)
    try {
      await onUpdate(comment.id, text)
      setIsEditing(false)
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await onDelete(comment.id)
    } finally {
      setSubmitting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
        {getInitials(comment.user?.name || '?')}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {comment.user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          {canEditOrDelete && !isEditing && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-brand-600 font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => setDeleteOpen(true)}
                className="text-xs text-gray-400 hover:text-red-600 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2">
            <CommentForm 
              initialValue={comment.comment} 
              onSubmit={handleUpdate} 
              onCancel={() => setIsEditing(false)} 
              submitting={submitting} 
            />
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mt-1">{comment.comment}</p>
        )}
      </div>
      
      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
      />
    </div>
  )
}
