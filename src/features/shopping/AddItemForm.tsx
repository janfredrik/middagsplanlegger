import { useState, useRef } from 'react'
import { useUser } from '../../context/UserContext'
import { guessCategory, getSuggestions, learnItem } from '../../lib/categorize'
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
  const [suggestions, setSuggestions] = useState<Array<{ word: string; category: ShoppingCategory }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleNameChange(value: string) {
    setName(value)
    setActiveSuggestion(-1)
    if (!categoryManuallySet) {
      const guessed = guessCategory(value, categories)
      if (guessed) setCategoryId(guessed.id)
    }
    const newSuggs = getSuggestions(value, categories)
    setSuggestions(newSuggs)
    setShowSuggestions(newSuggs.length > 0)
  }

  function handleSelectSuggestion(s: { word: string; category: ShoppingCategory }) {
    setName(s.word)
    setCategoryId(s.category.id)
    setCategoryManuallySet(false)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    inputRef.current?.focus()
  }

  function toggleTag(key: string) {
    setTags((prev) => prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key])
  }

  function handleAdd() {
    if (!name.trim() || !currentUser) return
    const resolvedCategory = categoryId || categories.find((c) => c.name === 'Annet')?.id || ''
    if (!resolvedCategory) return
    const resolvedCategoryName = categories.find((c) => c.id === resolvedCategory)?.name ?? ''
    learnItem(name.trim().toLowerCase(), resolvedCategoryName)
    onAdd({ name: name.trim(), quantity: quantity.trim(), category: resolvedCategory, added_by: currentUser.id, tags })
    setName('')
    setQuantity('')
    setCategoryId('')
    setCategoryManuallySet(false)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    setTags([])
  }

  const inputClass = 'text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveSuggestion((i) => Math.max(i - 1, -1))
            } else if (e.key === 'Escape') {
              setShowSuggestions(false)
              setActiveSuggestion(-1)
            } else if (e.key === 'Enter') {
              e.preventDefault()
              if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                handleSelectSuggestion(suggestions[activeSuggestion])
              } else {
                handleAdd()
              }
            }
          }}
          onBlur={() => setTimeout(() => { setShowSuggestions(false); setActiveSuggestion(-1) }, 300)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          placeholder="Legg til vare..."
          enterKeyHint="done"
          autoFocus
          className={`w-full font-medium ${inputClass}`}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul style={{ zIndex: 100 }} className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg">
            {suggestions.map((s, i) => (
              <li key={s.word}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                    i === activeSuggestion
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-200 active:bg-slate-100 dark:active:bg-slate-600'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{s.category.emoji}</span>
                  <span className="capitalize">{s.word}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
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
