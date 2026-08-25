import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function CommentForm({ initialValue = '', onSubmit, onCancel, submitting }) {
  const [text, setText] = useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit(text.trim())
    if (!initialValue) {
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment or note…"
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none disabled:opacity-50"
        disabled={submitting}
      />
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={submitting} disabled={!text.trim()}>
          {initialValue ? 'Save' : 'Post Comment'}
        </Button>
      </div>
    </form>
  )
}
