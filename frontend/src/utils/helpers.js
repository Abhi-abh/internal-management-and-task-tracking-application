/**
 * General helper utilities.
 */

/**
 * Build a URL query string from a plain object, omitting null/undefined/empty values.
 * @param {Record<string, any>} params
 * @returns {string} e.g. "?page=1&status=todo"
 */
export function buildQueryString(params) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      qs.append(key, String(value))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

/**
 * Deeply compare two plain objects for equality.
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Pick specific keys from an object.
 * @template T
 * @param {T} obj
 * @param {(keyof T)[]} keys
 * @returns {Partial<T>}
 */
export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key]
    return acc
  }, {})
}

/**
 * Omit specific keys from an object.
 * @template T
 * @param {T} obj
 * @param {(keyof T)[]} keys
 * @returns {Partial<T>}
 */
export function omit(obj, keys) {
  const keysSet = new Set(keys)
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keysSet.has(k)))
}

/**
 * Sleep for a given number of milliseconds (useful in async flows).
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate initials from a full name or username.
 * @param {string} name
 * @returns {string} e.g. "JD"
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
