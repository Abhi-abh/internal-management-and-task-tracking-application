import clsx from 'clsx'
import { TASK_PRIORITY_LABELS } from '@/constants'

const priorityStyles = {
  low: 'bg-green-100 text-green-700 ring-green-500/20',
  medium: 'bg-yellow-100 text-yellow-700 ring-yellow-500/20',
  high: 'bg-orange-100 text-orange-700 ring-orange-500/20',
  urgent: 'bg-red-100 text-red-700 ring-red-500/20',
}

const priorityDots = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

/**
 * Priority badge pill.
 *
 * @param {{ priority: string, size?: 'sm'|'md' }} props
 */
export default function PriorityBadge({ priority, size = 'md' }) {
  const label = TASK_PRIORITY_LABELS[priority] || priority
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        priorityStyles[priority] || 'bg-gray-100 text-gray-600 ring-gray-500/20'
      )}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', priorityDots[priority] || 'bg-gray-400')}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
