import React, { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/constants'
import { useUsers } from '@/hooks/useUsers'

/**
 * @param {{ initialData?: any, onSubmit: (data: any) => Promise<void>, onCancel: () => void, isSubmitting: boolean }} props
 */
export default function TaskForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const { users, loading: loadingUsers } = useUsers()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignee: '',
    due_date: '',
  })
  
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'pending',
        priority: initialData.priority || 'medium',
        assignee: initialData.assigned_to ? String(initialData.assigned_to) : '',
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
      })
    }
  }, [initialData])

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters'
    }
    
    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    } else {
      const selectedDate = new Date(formData.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.due_date = 'Due date cannot be in the past'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
      priority: formData.priority,
      assigned_to: formData.assignee ? parseInt(formData.assignee, 10) : null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    }

    onSubmit(payload)
  }

  const assigneeOptions = [
    { value: '', label: 'Select Assignee' },
    ...users.map(u => ({ value: String(u.id), label: u.name || u.username }))
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter task title"
        disabled={isSubmitting}
      />

      <div className="w-full">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150 disabled:opacity-50"
          placeholder="Optional task description"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Status"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={TASK_STATUS_OPTIONS}
          disabled={isSubmitting}
        />
        <Select
          label="Priority"
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={TASK_PRIORITY_OPTIONS}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Assignee"
          id="assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          options={assigneeOptions}
          error={errors.assignee}
          disabled={isSubmitting || loadingUsers}
        />
        <Input
          type="date"
          label="Due Date"
          id="due_date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          error={errors.due_date}
          disabled={isSubmitting}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
