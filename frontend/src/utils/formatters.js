/**
 * Date and text formatting utilities.
 */

/**
 * Format an ISO date string to a human-readable date.
 * @param {string|Date|null} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format an ISO date string to a human-readable date + time.
 * @param {string|Date|null} dateStr
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Return a relative time string ("2 hours ago", "in 3 days").
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = then - now
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour')
  return rtf.format(diffDay, 'day')
}

/**
 * Truncate a string to a maximum length, appending "…".
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export function truncate(str, max = 80) {
  if (!str) return ''
  return str.length <= max ? str : str.slice(0, max) + '…'
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert snake_case to Title Case.
 * @param {string} str
 * @returns {string}
 */
export function snakeToTitle(str) {
  if (!str) return ''
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
