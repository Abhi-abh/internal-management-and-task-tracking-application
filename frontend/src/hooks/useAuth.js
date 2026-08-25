import { useAuthContext } from '@/context/AuthContext'

/**
 * Convenience hook to access auth state and actions.
 * @returns {{ user, token, loading, isAuthenticated, login, register, logout }}
 */
export function useAuth() {
  return useAuthContext()
}
