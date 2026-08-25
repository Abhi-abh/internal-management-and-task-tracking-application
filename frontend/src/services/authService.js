import api from './api'
import { STORAGE_KEYS } from '@/constants'

const authService = {
  /**
   * Register a new user.
   * @param {{ email: string, name: string, password: string }} data
   */
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  /**
   * Login with email + password.
   * @param {{ email: string, password: string }} credentials
   * @returns {{ access_token: string, token_type: string }}
   */
  async login({ email, password }) {
    // FastAPI OAuth2 expects form-encoded data
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  },

  /**
   * Fetch the current authenticated user profile.
   */
  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  /**
   * Persist token and user to localStorage.
   * @param {string} token
   * @param {object} user
   */
  persistSession(token, user) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
  },

  /**
   * Clear all auth data from localStorage.
   */
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  },

  /**
   * Return the stored token, or null.
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  /**
   * Return the stored user, or null.
   * @returns {object|null}
   */
  getStoredUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
}

export default authService
