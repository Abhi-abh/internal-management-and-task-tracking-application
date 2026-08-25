import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { useTasks } from '@/hooks/useTasks'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import StatCard from '@/components/dashboard/StatCard'
import ErrorState from '@/components/ui/ErrorState'
import { ROUTES } from '@/constants'

// Icons used in StatCards
const Icons = {
  Total: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Pending: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  InProgress: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Completed: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Blocked: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  Overdue: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  MyTasks: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Refresh: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

/**
 * Dashboard page showing key metrics pulled from the backend API.
 */
export default function Dashboard() {
  const { stats, loading, error, refetch: refetchStats } = useDashboard()

  // Fetch up to 100 recent tasks so we can filter them locally for the dashboard cards
  const { tasks, refetch: refetchTasks } = useTasks({ limit: 100, sort_by: 'created_at', sort_order: 'desc' })

  const refetchAll = () => {
    refetchStats()
    refetchTasks()
  }

  if (loading) return <DashboardSkeleton />
  if (error) {
    return (
      <div className="pt-4">
        <ErrorState
          title="Unable to load dashboard"
          message={error}
          onRetry={refetchAll}
        />
      </div>
    )
  }

  // Graceful fallback if stats is unexpectedly undefined but there's no error
  const safeStats = stats || {}

  // Compute local lists
  const recentTasks = tasks.slice(0, 5)

  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false
    const due = new Date(t.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }).slice(0, 5)

  const highPriorityTasks = tasks.filter(t =>
    (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'completed'
  ).slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of all tasks and team activity</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refetchAll}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Refresh Dashboard"
          >
            {Icons.Refresh}
            Refresh
          </button>

          <Link
            to={ROUTES.TASKS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Core Task Totals */}
        <StatCard
          title="Total Tasks"
          value={safeStats.total_tasks}
          icon={Icons.Total}
          variant="brand"
          link={ROUTES.TASKS}
        />

        <StatCard
          title="Tasks assigned to me"
          value={safeStats.current_user_tasks}
          icon={Icons.MyTasks}
          variant="indigo"
          link={`${ROUTES.TASKS}?assignee=me`}
        />

        <StatCard
          title="Overdue Tasks"
          value={safeStats.overdue_tasks}
          icon={Icons.Overdue}
          variant="red"
        />

        <StatCard
          title="Blocked Tasks"
          value={safeStats.blocked_tasks}
          icon={Icons.Blocked}
          variant="yellow"
        />

        {/* Status Breakdown row */}
        <StatCard
          title="Pending"
          value={safeStats.pending_tasks}
          icon={Icons.Pending}
          variant="default"
        />

        <StatCard
          title="In Progress"
          value={safeStats.in_progress_tasks}
          icon={Icons.InProgress}
          variant="blue"
        />

        <StatCard
          title="Completed"
          value={safeStats.completed_tasks}
          icon={Icons.Completed}
          variant="green"
        />
      </div>

      {/* Task Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <TaskSummaryList title="Recently Added" tasks={recentTasks} />
        <TaskSummaryList title="Overdue Tasks" tasks={overdueTasks} emptyMessage="No overdue tasks" isDanger />
        <TaskSummaryList title="High Priority" tasks={highPriorityTasks} emptyMessage="No high priority tasks" />
      </div>
    </div>
  )
}

function TaskSummaryList({ title, tasks, emptyMessage = "No tasks found", isDanger = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-base ${isDanger ? 'text-red-700' : 'text-gray-900'}`}>{title}</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tasks && tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id} className="group">
                <Link to={`/tasks/${task.id}`} className="block p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-brand-700">{task.title}</p>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                      task.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      task.status === 'blocked' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                      'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    {task.due_date && (
                      <span className={isDanger || (new Date(task.due_date) < new Date() && task.status !== 'completed') ? 'text-red-600 font-medium' : ''}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400 italic bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}
