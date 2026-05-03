interface AvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md'
}

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase()
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  )
}
