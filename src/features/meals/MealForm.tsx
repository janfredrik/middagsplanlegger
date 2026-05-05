import { useState } from 'react'
import { guessCategory } from '../../lib/categorize'
import { MEAL_CATEGORIES } from './mealCategories'
import type { Meal, MealIngredient, ShoppingCategory } from '../../types'
import type { SaveIngredient } from './useMeals'

type IngredientDraft = {
  uid: string
  name: string
  quantity: string
  category: string
}

interface InitialData {
  name: string
  category: string
  ingredients: Array<{ name: string; quantity: string }>
}

interface Props {
  meal?: Meal
  existingIngredients?: MealIngredient[]
  categories: ShoppingCategory[]
  initialData?: InitialData
  onSave: (name: string, description: string, category: string, ingredients: SaveIngredient[]) => void
  onCancel: () => void
}

export function MealForm({ meal, existingIngredients = [], categories, initialData, onSave, onCancel }: Props) {
  const [name, setName] = useState(meal?.name ?? initialData?.name ?? '')
  const description = meal?.description ?? ''
  const [mealCategory, setMealCategory] = useState(meal?.category ?? initialData?.category ?? '')
  const [drafts, setDrafts] = useState<IngredientDraft[]>(
    existingIngredients.length > 0
      ? existingIngredients.map((i) => ({ uid: crypto.randomUUID(), name: i.name, quantity: i.quantity, category: i.category }))
      : initialData && initialData.ingredients.length > 0
      ? initialData.ingredients.map((i) => ({
          uid: crypto.randomUUID(),
          name: i.name,
          quantity: i.quantity,
          category: guessCategory(i.name, categories)?.id ?? '',
        }))
      : [{ uid: crypto.randomUUID(), name: '', quantity: '', category: '' }]
  )

  function updateDraft(index: number, field: keyof IngredientDraft, value: string) {
    setDrafts((p) => {
      const updated = [...p]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'name' && !updated[index].category) {
        const guessed = guessCategory(value, categories)
        if (guessed) updated[index].category = guessed.id
      }
      return updated
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const valid = drafts.filter((d) => d.name.trim())
    onSave(name.trim(), description.trim(), mealCategory, valid)
  }

  const inputClass = 'text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/40 flex flex-col gap-3">
      <input
        autoFocus value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Middagsnavn..." required
        className={`w-full ${inputClass}`}
      />
      <select
        value={mealCategory}
        onChange={(e) => setMealCategory(e.target.value)}
        className={`w-full ${inputClass}`}
      >
        <option value="">Kategori (valgfri)</option>
        {MEAL_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Ingredienser</p>
      {drafts.map((d, i) => (
        <div key={d.uid} className="flex gap-1.5 items-center">
          <input
            value={d.name} onChange={(e) => updateDraft(i, 'name', e.target.value)}
            placeholder="Ingrediens..."
            className={`flex-1 ${inputClass}`}
          />
          <input
            value={d.quantity} onChange={(e) => updateDraft(i, 'quantity', e.target.value)}
            placeholder="Mengde"
            className={`w-16 ${inputClass}`}
          />
          <select
            value={d.category} onChange={(e) => updateDraft(i, 'category', e.target.value)}
            className={`w-24 ${inputClass}`}
          >
            <option value="">Kat.</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setDrafts((p) => p.filter((_, j) => j !== i))}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 active:text-red-400 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setDrafts((p) => [...p, { uid: crypto.randomUUID(), name: '', quantity: '', category: '' }])}
        className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold text-left active:text-indigo-800 transition-colors"
      >
        + Ingrediens
      </button>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4 py-2 rounded-xl active:bg-slate-50 dark:active:bg-slate-700 transition-colors">
          Avbryt
        </button>
        <button type="submit" className="text-sm bg-indigo-600 text-white rounded-xl px-5 py-2 font-semibold shadow-xs active:bg-indigo-700 transition-colors">
          Lagre
        </button>
      </div>
    </form>
  )
}
