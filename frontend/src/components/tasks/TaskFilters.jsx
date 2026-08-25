import React from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/constants'
import { useUsers } from '@/hooks/useUsers'

/**
 * Task filters component.
 *
 * @param {{ search: string, status: string, priority: string, assignee: string, onSearchChange: (e: any) => void, onFilterChange: (key: string, value: string) => void, onClearFilters: () => void }} props
 */
export default function TaskFilters({
  search,
  status,
  priority,
  assignee,
  onSearchChange,
  onFilterChange,
  onClearFilters,
}) {
  const { users, loading: loadingUsers } = useUsers()

  const assigneeOptions = users.map((user) => ({
    value: String(user.id),
    label: user.name || user.username,
  }))

  const hasFilters = search || status || priority || assignee;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          id="task-search"
          placeholder="Search tasks…"
          value={search}
          onChange={onSearchChange}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          id="task-status-filter"
          placeholder="All statuses"
          options={TASK_STATUS_OPTIONS}
          value={status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        />
        <Select
          id="task-priority-filter"
          placeholder="All priorities"
          options={TASK_PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        />
        <Select
          id="task-assignee-filter"
          placeholder={loadingUsers ? "Loading users..." : "All assignees"}
          options={assigneeOptions}
          value={assignee}
          onChange={(e) => onFilterChange('assignee', e.target.value)}
          disabled={loadingUsers}
        />
      </div>
      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
