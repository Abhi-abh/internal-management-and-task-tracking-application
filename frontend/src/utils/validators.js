/**
 * Form validation utilities.
 */

/**
 * Check if an email address is valid.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Check if a password meets minimum requirements.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' }
  }
  return { valid: true, message: '' }
}

/**
 * Return an error message if a required field is empty.
 * @param {string} value
 * @param {string} fieldName
 * @returns {string}
 */
export function required(value, fieldName = 'This field') {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required.`
  }
  return ''
}

/**
 * Validate task form data and return an object of field → error messages.
 * @param {{ title: string, status: string, priority: string }} data
 * @returns {Record<string, string>}
 */
export function validateTaskForm(data) {
  const errors = {}
  const titleErr = required(data.title, 'Title')
  if (titleErr) errors.title = titleErr
  if (data.title && data.title.length > 255) {
    errors.title = 'Title must be 255 characters or fewer.'
  }
  return errors
}
