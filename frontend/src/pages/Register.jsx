import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { useAuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import authService from '@/services/authService'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const { login, isAuthenticated } = useAuthContext()
  const navigate = useNavigate()
  const toast = useToast()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setServerError(null)
    setErrors({})

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' })
      setLoading(false)
      return
    }

    try {
      // 1. Register the user
      // Create a copy without confirmPassword for the API call
      const { confirmPassword, ...registerData } = formData
      await authService.register(registerData)

      toast.success('Account created successfully! Please log in.')
      navigate(ROUTES.LOGIN)
    } catch (err) {
      if (err?.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setServerError(err.response.data.detail)
        } else if (Array.isArray(err.response.data.detail)) {
          const fieldErrors = {}
          err.response.data.detail.forEach((d) => {
            if (d.loc && d.loc.length > 0) {
              const field = d.loc[d.loc.length - 1]
              fieldErrors[field] = d.msg
            }
          })

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
          } else {
            setServerError('Validation failed. Please check your inputs.')
          }
        }
      } else {
        setServerError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {serverError}
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={loading}
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={loading}
          />

          <Button type="submit" className="w-full py-2.5 text-base" loading={loading}>
            Create account
          </Button>
        </form>
      </div>
    </div>
  )
}
