import clsx from 'clsx'

const roleStyles = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  member: 'bg-gray-100 text-gray-800 border-gray-200',
}

export default function RoleBadge({ role }) {
  const normalizedRole = (role || 'member').toLowerCase()
  const styles = roleStyles[normalizedRole] || roleStyles.member

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles
      )}
    >
      {normalizedRole.toUpperCase()}
    </span>
  )
}
