import { forwardRef } from 'react'
import clsx from 'clsx'

/**
 * Reusable Select component.
 *
 * @param {{ label?: string, error?: string, options: { value: string, label: string }[], placeholder?: string }} props
 */
const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className = '', id, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={clsx(
          'block w-full rounded-lg border py-2 pl-3 pr-8 text-sm text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          'transition-colors duration-150 appearance-none bg-white',
          error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300',
          className
        )}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Select
