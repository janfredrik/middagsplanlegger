import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import { guessCategory } from '../../lib/categorize'
import type { ShoppingCategory } from '../../types'
import { SHOPPING_TAGS } from './tags'

interface Props {
  categories: ShoppingCategory[]
  onAdd: (data: { name: string; quantity: string; category: string; added_by: string; tags?: string[] }) => void
}

export function AddItemForm({ categories, onAdd }: Props) {
  const { currentUser } = useUser()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [categoryManuallySet, setCategoryManuallySet] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!categoryManuallySet) {
      const guessed = guessCategory(value, categories)
      if (guessed) setCategoryId(guessed.id)
    }
  }

  function toggleTag(key: string) {
    setTags((prev) => prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key])
  }

  function handleAdd() {
    if (!name.trim() || !currentUser) return
    const resolvedCategory = categoryId || categories.find((c) => c.name === 'Annet')?.id || ''
    if (!resolvedCategory) return
    onAdd({ name: name.trim(), quantity: quantity.trim(), category: resolvedCategory, added_by: currentUser.id, tags })
    setName('')
    setQuantity('')
    setCategoryId('')
    setCategoryManuallySet(false)
    setTags([])
  }

  const inputClass = 'text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'

  return (
    <div className="flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
        placeholder="Legg til vare..."
        enterKeyHint="done"
        autoFocus
        className={`font-medium ${inputClass}`}
      />
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: '4.5rem minmax(0, 1fr) 2.75rem' }}
      >
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Mengde"
          className={inputClass}
        />
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setCategoryManuallySet(e.target.value !== '') }}
          className={`min-w-0 truncate ${inputClass}`}
        >
          <option value="">Kategori...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-indigo-600 text-white rounded-xl text-xl font-semibold active:bg-indigo-700 transition-colors"
        >
          +
        </button>
      </div>
      <div className="flex gap-2">
        {SHOPPING_TAGS.map((tag) => {
          const active = tags.includes(tag.key)
          return (
            <button
              key={tag.key}
              type="button"
              onClick={() => toggleTag(tag.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                active
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-400 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className="text-base">{tag.emoji}</span>
              <span className="text-xs">{tag.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
