import clsx from 'clsx'
import { TASK_STATUS_LABELS } from '@/constants'

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700 ring-yellow-500/20',
  in_progress: 'bg-blue-100 text-blue-700 ring-blue-500/20',
  completed: 'bg-green-100 text-green-700 ring-green-500/20',
  blocked: 'bg-red-100 text-red-700 ring-red-500/20',
}

/**
 * Status badge pill.
 *
 * @param {{ status: string, size?: 'sm'|'md' }} props
 */
export default function StatusBadge({ status, size = 'md' }) {
  const label = TASK_STATUS_LABELS[status] || status
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        statusStyles[status] || 'bg-gray-100 text-gray-600 ring-gray-500/20'
      )}
    >
      {label}
    </span>
  )
}
