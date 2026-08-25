import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { formatDate, truncate } from '@/utils/formatters'
import { getInitials } from '@/utils/helpers'

/**
 * Task card for grid/list views.
 *
 * @param {{ task: object, onClick?: () => void }} props
 */
export default function TaskCard({ task, onClick }) {
  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    task.status !== 'cancelled' &&
    new Date(task.due_date) < new Date()

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200 p-4 cursor-pointer group"
      onClick={onClick}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} size="sm" />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {truncate(task.description, 100)}
        </p>
      )}

      {/* Status */}
      <div className="mb-3">
        <StatusBadge status={task.status} size="sm" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-[10px]">
                {getInitials(task.assignee.full_name || task.assignee.username)}
              </div>
              <span>{task.assignee.username}</span>
            </>
          ) : (
            <span className="text-gray-300 italic">Unassigned</span>
          )}
        </div>

        {/* Due date */}
        {task.due_date && (
          <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
            {isOverdue ? '⚠ ' : ''}
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Comment count */}
      {task.comment_count > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {task.comment_count}
        </div>
      )}
    </div>
  )
}
