import { formatRelativeTime } from '@/utils/formatters'

export default function ActivityTimeline({ activity, loading, error }) {
  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading activity...</div>
  }
  
  if (error) {
    return <div className="p-4 text-sm text-red-500">Failed to load activity</div>
  }
  
  if (!activity || activity.length === 0) {
    return <div className="p-4 text-sm text-gray-500 text-center">No activity recorded yet.</div>
  }

  const formatAction = (item) => {
    switch (item.action) {
      case 'task_created':
        return 'created the task'
      case 'task_updated':
        return 'updated the task'
      case 'status_changed':
        return `changed status to ${item.new_value}`
      case 'priority_changed':
        return `changed priority to ${item.new_value}`
      case 'assignee_changed':
        if (!item.new_value || item.new_value === 'None') return 'removed the assignee'
        return `assigned the task`
      case 'comment_added':
        return 'added a comment'
      case 'comment_deleted':
        return 'deleted a comment'
      default:
        return item.action.replace('_', ' ')
    }
  }

  return (
    <div className="space-y-6">
      {activity.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          {/* Timeline connector */}
          {index !== activity.length - 1 && (
            <div className="absolute top-8 left-4 bottom-0 w-px bg-gray-200 -ml-px" />
          )}
          
          <div className="relative w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 z-10">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex-1 pt-1.5 pb-2">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{item.user?.name || 'System'}</span>{' '}
              {formatAction(item)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(item.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
