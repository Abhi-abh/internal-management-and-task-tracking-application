import clsx from 'clsx'
import Button from './Button'

/**
 * Pagination controls.
 *
 * @param {{ page: number, totalPages: number, onPageChange: (page: number) => void, loading?: boolean }} props
 */
export default function Pagination({ page, totalPages, onPageChange, loading = false }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-4" aria-label="Pagination">
      {/* Previous */}
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      {/* First page */}
      {pages[0] > 1 && (
        <>
          <PageButton page={1} current={page} onClick={onPageChange} />
          {pages[0] > 2 && <span className="px-2 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageButton key={p} page={p} current={page} onClick={onPageChange} />
      ))}

      {/* Last page */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">…</span>
          )}
          <PageButton page={totalPages} current={page} onClick={onPageChange} />
        </>
      )}

      {/* Next */}
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </nav>
  )
}

function PageButton({ page, current, onClick }) {
  const isActive = page === current
  return (
    <button
      onClick={() => onClick(page)}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium transition-colors duration-100',
        isActive
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {page}
    </button>
  )
}
