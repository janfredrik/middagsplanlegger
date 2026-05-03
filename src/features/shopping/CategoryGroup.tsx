import type { ShoppingCategory, ShoppingItem } from '../../types'
import { ShoppingItemRow } from './ShoppingItemRow'

interface Props {
  category: ShoppingCategory
  items: ShoppingItem[]
  onToggle: (item: ShoppingItem) => void
  onDelete: (id: string) => void
  onLongPress: (item: ShoppingItem) => void
}

export function CategoryGroup({ category, items, onToggle, onDelete, onLongPress }: Props) {
  if (items.length === 0) return null

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)
  const sorted = [
    ...unchecked.filter((i) => (i.tags ?? []).includes('naa')),
    ...unchecked.filter((i) => !(i.tags ?? []).includes('naa')),
    ...checked,
  ]

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-base">{category.emoji}</span>
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{category.name}</h3>
        <span className="text-xs text-slate-300 dark:text-slate-600 font-medium ml-auto">{unchecked.length}/{items.length}</span>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/40 divide-y divide-slate-50 dark:divide-slate-700/50">
        {sorted.map((item) => (
          <ShoppingItemRow
            key={item.id}
            item={item}
            onToggle={() => onToggle(item)}
            onDelete={() => onDelete(item.id)}
            onLongPress={() => onLongPress(item)}
          />
        ))}
      </div>
    </div>
  )
}
