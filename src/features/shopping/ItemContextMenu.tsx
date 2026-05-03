import { useEffect, useState } from 'react'
import type { ShoppingCategory, ShoppingItem } from '../../types'
import { SHOPPING_TAGS } from './tags'

interface Props {
  item: ShoppingItem
  categories: ShoppingCategory[]
  onClose: () => void
  onChangeCategory: (categoryId: string) => void
  onToggleTag: (tagKey: string) => void
}

export function ItemContextMenu({ item, categories, onClose, onChangeCategory, onToggleTag }: Props) {
  const [visible, setVisible] = useState(false)
  const tags = item.tags ?? []

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className={`relative w-full bg-white dark:bg-slate-800 rounded-t-3xl px-5 pt-4 pb-10 shadow-2xl transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4" />
        <p className="font-semibold text-slate-800 dark:text-slate-100 mb-5 text-base truncate">{item.name}</p>

        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Kategori</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { onChangeCategory(cat.id); onClose() }}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all active:scale-95 ${
                item.category === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-700/60 active:bg-slate-100 dark:active:bg-slate-700'
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-tight text-center line-clamp-2">{cat.name}</span>
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tags</p>
        <div className="flex gap-2">
          {SHOPPING_TAGS.map((tag) => {
            const active = tags.includes(tag.key)
            return (
              <button
                key={tag.key}
                onClick={() => { onToggleTag(tag.key); onClose() }}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95 ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-700/60 active:bg-slate-100 dark:active:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{tag.emoji}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center leading-tight">{tag.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
