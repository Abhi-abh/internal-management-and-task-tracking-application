import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

export default function UserForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const isEditMode = !!initialData

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Never populate password
        role: initialData.role || 'member'
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Construct payload
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role
    }

    if (!isEditMode) {
      payload.password = formData.password
    } else if (formData.password) {
      // If backend explicitly supports updating password this way
      // But typically it's a separate flow. We'll send it only if filled in edit mode,
      // assuming backend ignores it or uses it if present.
      // Wait, backend `UserUpdate` schema doesn't have password.
      // So we shouldn't send it.
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g. John Doe"
        required
        disabled={isSubmitting}
      />
      
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="e.g. john@example.com"
        required
        disabled={isSubmitting}
      />

      {!isEditMode && (
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 8 characters"
          required
          minLength={8}
          disabled={isSubmitting}
        />
      )}

      <Select
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'manager', label: 'Manager' },
          { value: 'member', label: 'Member' },
        ]}
        required
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditMode ? 'Save Changes' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}
