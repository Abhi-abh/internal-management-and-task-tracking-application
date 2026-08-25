import { formatDate, formatRelativeTime } from '@/utils/formatters'

export default function TaskInfo({ task }) {
  const MetaItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">{task.title}</h1>
      
      {task.description ? (
        <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">
          {task.description}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic mb-6">No description provided.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
        <MetaItem label="Assignee" value={task.assignee?.name || task.assignee?.username || 'Unassigned'} />
        <MetaItem label="Due Date" value={task.due_date ? formatDate(task.due_date) : '—'} />
        <MetaItem label="Created" value={formatRelativeTime(task.created_at)} />
        <MetaItem label="Updated" value={formatRelativeTime(task.updated_at)} />
      </div>
    </div>
  )
}
