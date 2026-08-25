import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function StatCard({ title, value, icon, variant = 'default', link }) {
  const variants = {
    default: 'bg-gray-50 text-gray-600',
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }

  const colorClass = variants[variant] || variants.default

  const cardContent = (
    <div className="flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colorClass)}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value !== undefined && value !== null ? value : 0}
        </p>
      </div>
    </div>
  )

  const cardWrapperClass = clsx(
    'bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-all',
    link ? 'hover:shadow-md hover:border-brand-300 cursor-pointer' : ''
  )

  if (link) {
    return (
      <Link to={link} className={cardWrapperClass} aria-label={`View ${title}`}>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={cardWrapperClass}>
      {cardContent}
    </div>
  )
}
