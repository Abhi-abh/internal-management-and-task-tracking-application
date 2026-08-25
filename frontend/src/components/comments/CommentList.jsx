import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import { useState } from 'react'

export default function CommentList({ comments, loading, error, currentUser, onCreate, onUpdate, onDelete }) {
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (text) => {
    setSubmitting(true)
    try {
      await onCreate(text)
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Failed to load comments.</div>
  }

  return (
    <div className="space-y-6">
      {/* Create Comment Form */}
      <div className="flex gap-4 border-b border-gray-100 pb-6">
        <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {currentUser ? currentUser.name?.charAt(0).toUpperCase() : '?'}
        </div>
        <CommentForm onSubmit={handleCreate} submitting={submitting} />
      </div>

      {/* List of comments */}
      {loading ? (
        <div className="text-sm text-gray-500 py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">No comments yet.</div>
      ) : (
        <div className="space-y-6 pt-2">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              currentUser={currentUser} 
              onUpdate={onUpdate} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
