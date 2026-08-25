import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import authService from '@/services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())
  const [token, setToken] = useState(() => authService.getToken())
  const [loading, setLoading] = useState(!!authService.getToken())
  const [error, setError] = useState(null)

  // On mount, verify stored token is still valid
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .getMe()
      .then((userData) => {
        setUser(userData)
        authService.persistSession(token, userData)
      })
      .catch(() => {
        // Token invalid — clear everything
        authService.clearSession()
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async ({ email, password }) => {
    setError(null)
    const tokenData = await authService.login({ email, password })
    // Save token so the api interceptor can attach it for getMe()
    localStorage.setItem('taskboard_token', tokenData.access_token)
    const userData = await authService.getMe()
    authService.persistSession(tokenData.access_token, userData)
    setToken(tokenData.access_token)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    setError(null)
    return authService.register(data)
  }, [])

  const logout = useCallback(() => {
    authService.clearSession()
    setUser(null)
    setToken(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
