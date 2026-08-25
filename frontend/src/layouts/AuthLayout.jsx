import { Outlet } from 'react-router-dom'

/**
 * Centered layout for auth pages (login, register).
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          
          <h1 className="text-3xl font-bold text-white tracking-tight">TaskBoard</h1>
          <p className="text-brand-300 text-sm mt-1">Internal Management Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-in">
          <Outlet />
        </div>

        <p className="text-center text-brand-400 text-xs mt-6">
          © {new Date().getFullYear()} TaskBoard. All rights reserved.
        </p>
      </div>
    </div>
  )
}
