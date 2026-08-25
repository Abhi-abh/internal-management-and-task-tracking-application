import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import Button from '@/components/ui/Button'

export default function TaskDetailHeader({ task, onEdit, onDelete }) {
  const navigate = useNavigate()
  
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Back to Tasks"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="hidden sm:block text-gray-300">|</div>
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit Task
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          Delete Task
        </Button>
      </div>
    </div>
  )
}
