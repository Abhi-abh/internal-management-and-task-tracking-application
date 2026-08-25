import Table from '@/components/ui/Table'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { formatDate } from '@/utils/formatters'
import { getInitials } from '@/utils/helpers'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

import { useAuthContext } from '@/context/AuthContext'

/**
 * Responsive task table.
 *
 * @param {{ tasks: any[], loading: boolean, onSort: (field: string) => void, sortBy: string, sortOrder: string, onEdit: (task: any) => void, onDelete: (task: any) => void }} props
 */
export default function TaskTable({
  tasks,
  loading,
  onSort,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
}) {
  const { user } = useAuthContext();
  
  // Helper to render a sortable column header
  const SortableHeader = ({ label, field }) => {
    const isSorted = sortBy === field;
    return (
      <div
        className="flex items-center gap-1 cursor-pointer select-none hover:text-gray-700"
        onClick={() => onSort(field)}
      >
        {label}
        <span className="text-gray-400">
          {isSorted ? (
            sortOrder === 'asc' ? (
              <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )
          ) : (
            <svg className="w-3 h-3 opacity-0 group-hover:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          )}
        </span>
      </div>
    );
  };

  const columns = [
    {
      key: 'title',
      header: <SortableHeader label="Task" field="title" />,
      render: (task) => (
        <Link to={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-brand-600 truncate max-w-[200px] block">
          {task.title}
        </Link>
      ),
    },
    {
      key: 'assignee',
      header: 'Assignee', // API might not support sorting by assignee easily if it's a relation, so not sortable
      render: (task) => (
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <>
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-[10px]">
                {getInitials(task.assignee.full_name || task.assignee.name || task.assignee.username || '')}
              </div>
              <span className="truncate max-w-[120px]">{task.assignee.name || task.assignee.username}</span>
            </>
          ) : (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      header: <SortableHeader label="Priority" field="priority" />,
      render: (task) => <PriorityBadge priority={task.priority} size="sm" />,
    },
    {
      key: 'status',
      header: <SortableHeader label="Status" field="status" />,
      render: (task) => <StatusBadge status={task.status} size="sm" />,
    },
    {
      key: 'due_date',
      header: <SortableHeader label="Due Date" field="due_date" />,
      render: (task) => {
        if (!task.due_date) return <span className="text-gray-400">-</span>;
        const isOverdue =
          task.status !== 'completed' &&
          task.status !== 'cancelled' &&
          new Date(task.due_date) < new Date();
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {isOverdue && '⚠ '}
            {formatDate(task.due_date)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: <SortableHeader label="Created" field="created_at" />,
      render: (task) => <span className="text-gray-500">{formatDate(task.created_at)}</span>,
    },
    {
      key: 'updated_at',
      header: <SortableHeader label="Updated" field="updated_at" />,
      render: (task) => <span className="text-gray-500">{formatDate(task.updated_at)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (task) => {
        const canEditOrDelete = user?.role === 'admin' || user?.role === 'manager' || user?.id === task.created_by;
        if (!canEditOrDelete) return <div className="text-gray-400 text-xs text-center">-</div>;
        
        return (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onDelete(task)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  // If user is a member, hide the actions column completely
  const visibleColumns = user?.role === 'member' 
    ? columns.filter(col => col.key !== 'actions')
    : columns;

  return <Table columns={visibleColumns} data={tasks} loading={loading} emptyMessage="No tasks found." />;
}
