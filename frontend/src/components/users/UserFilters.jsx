import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

export default function UserFilters({ initialSearch, initialRole, onFilterChange }) {
  const [search, setSearch] = useState(initialSearch || '')
  const [role, setRole] = useState(initialRole || '')

  const debouncedSearch = useDebounce(search, 400)

  // Sync back to parent when debounced search or role changes
  useEffect(() => {
    onFilterChange({ search: debouncedSearch, role })
  }, [debouncedSearch, role, onFilterChange])

  // Sync internal state if URL parameters change externally
  useEffect(() => {
    setSearch(initialSearch || '')
    setRole(initialRole || '')
  }, [initialSearch, initialRole])

  const hasFilters = search !== '' || role !== ''

  const handleClear = () => {
    setSearch('')
    setRole('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'member', label: 'Member' },
            ]}
          />
        </div>
        
        {hasFilters && (
          <Button variant="secondary" onClick={handleClear} className="w-full sm:w-auto shrink-0">
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
