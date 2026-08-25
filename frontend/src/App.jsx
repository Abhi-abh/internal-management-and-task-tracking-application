import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Auth guard
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Pages
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Tasks from '@/pages/Tasks'
import TaskDetail from '@/pages/TaskDetail'
import Users from '@/pages/Users'
import NotFound from '@/pages/NotFound'
import Register from '@/pages/Register'

export default function App() {
  return (
    <Routes>
      {/* Auth layout (unauthenticated) */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Route>

      {/* Main layout (authenticated) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.TASKS} element={<Tasks />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path={ROUTES.USERS} element={<Users />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
