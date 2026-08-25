import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import { ROUTES } from '@/constants'
import { isValidEmail } from '@/utils/validators'

/**
 * Login page.
 */
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.email) errs.email = 'Email is required.'
    else if (!isValidEmail(form.email)) errs.email = 'Please enter a valid email.'
    if (!form.password) errs.password = 'Password is required.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    setServerError('')
    try {
      await login({ email: form.email, password: form.password })
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(
        err?.response?.data?.detail || 'Login failed. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sign in to your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
            Register here
          </Link>
        </p>
      </div>

      {serverError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg mb-4">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          autoFocus
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
          className="mt-2"
        >
          Sign in
        </Button>
      </form>
    </div>
  )
}
