import { useEffect, useState } from 'react'

/**
 * Debounce a value by a given delay.
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 400ms)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
