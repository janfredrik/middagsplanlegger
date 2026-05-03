import { useState, useEffect, useRef } from 'react'
import type { ShoppingItem } from '../../types'
import { SHOPPING_TAGS } from './tags'
import { useLongPress } from './useLongPress'

interface Props {
  item: ShoppingItem
  onToggle: () => void
  onDelete: () => void
  onLongPress: () => void
}

export function ShoppingItemRow({ item, onToggle, onDelete, onLongPress }: Props) {
  const longPress = useLongPress(onLongPress)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tags = (item.tags ?? [])
    .map((key) => SHOPPING_TAGS.find((t) => t.key === key))
    .filter(Boolean)

  useEffect(() => () => { if (confirmTimer.current) clearTimeout(confirmTimer.current) }, [])

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000)
    } else {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
      setConfirmDelete(false)
      onDelete()
    }
  }

  return (
    <div
      className={`flex items-center gap-3 py-3 px-1 transition-opacity duration-150 select-none ${item.checked ? 'opacity-40' : ''}`}
      {...longPress}
    >
      <button
        onClick={onToggle}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${
          item.checked
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-slate-300 dark:border-slate-600 active:border-indigo-400'
        }`}
      >
        {item.checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm font-medium flex items-center gap-1 min-w-0 ${item.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
        <span className="truncate">
          {item.name}
          {item.quantity && <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">({item.quantity})</span>}
        </span>
        {tags.length > 0 && (
          <span className="flex gap-0.5 shrink-0">
            {tags.map((tag) => tag && <span key={tag.key}>{tag.emoji}</span>)}
          </span>
        )}
      </span>
      <button
        onClick={handleDeleteClick}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        title={confirmDelete ? 'Trykk igjen for å bekrefte' : 'Slett'}
        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
          confirmDelete
            ? 'text-red-400 bg-red-50 dark:bg-red-900/30'
            : 'text-slate-300 dark:text-slate-600 active:text-red-400'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
