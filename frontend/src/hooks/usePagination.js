import { useCallback, useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/constants'

/**
 * Manage pagination state.
 * @param {{ initialPage?: number, initialPageSize?: number }} options
 * @returns {{ page, pageSize, setPage, setPageSize, resetPage, paginationProps }}
 */
export function usePagination({ initialPage = 1, initialPageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const setPage = useCallback((newPage) => {
    setPageState(Math.max(1, newPage))
  }, [])

  const setPageSize = useCallback((newSize) => {
    setPageSizeState(newSize)
    setPageState(1) // Reset to page 1 when page size changes
  }, [])

  const resetPage = useCallback(() => {
    setPageState(1)
  }, [])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
    paginationProps: { page, page_size: pageSize },
  }
}
