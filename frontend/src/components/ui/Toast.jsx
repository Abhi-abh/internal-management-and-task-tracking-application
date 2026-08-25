import { useEffect } from 'react';

/**
 * Toast notification component.
 *
 * @param {{ toast: { id: number, message: string, type: 'success' | 'error' | 'info' }, onClose: () => void }} props
 */
export default function Toast({ toast, onClose }) {
  const { message, type } = toast;

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={`flex items-center gap-3 w-80 max-w-full p-4 rounded-xl shadow-lg border animate-fade-in ${typeClasses[type]}`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconClasses[type]}`}>
        {type === 'success' && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {type === 'info' && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 p-1.5 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
