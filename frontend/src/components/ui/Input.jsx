import { forwardRef, useState } from 'react'
import clsx from 'clsx'

/**
 * Reusable Input component.
 *
 * @param {{ label?: string, error?: string, hint?: string, leftIcon?: React.ReactNode, rightIcon?: React.ReactNode }} props
 */
const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, rightIcon, className = '', id, type = 'text', ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const handleTogglePassword = (e) => {
    e.preventDefault()
    setShowPassword(!showPassword)
  }

  const defaultRightIcon = isPassword ? (
    <button
      type="button"
      onClick={handleTogglePassword}
      className="text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      tabIndex={-1}
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  ) : null

  const finalRightIcon = rightIcon || defaultRightIcon

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          ref={ref}
          type={inputType}
          className={clsx(
            'block w-full rounded-lg border py-2 text-sm text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            'transition-colors duration-150',
            leftIcon ? 'pl-10' : 'pl-3',
            finalRightIcon ? 'pr-10' : 'pr-3',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 bg-white',
            className
          )}
          {...rest}
        />
        {finalRightIcon && (
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 ${!isPassword ? 'pointer-events-none' : ''}`}>
            {finalRightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
})

export default Input
