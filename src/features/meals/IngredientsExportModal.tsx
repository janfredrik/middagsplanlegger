import { useState } from 'react'
import type { Meal, MealIngredient, ShoppingItem } from '../../types'

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

interface Props {
  meal: Meal
  date: string
  ingredients: MealIngredient[]
  shoppingItems: ShoppingItem[]
  onAdd: (selected: MealIngredient[]) => Promise<void>
  onClose: () => void
}

export function IngredientsExportModal({ meal, date, ingredients, shoppingItems, onAdd, onClose }: Props) {
  const d = new Date(date + 'T12:00:00')
  const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1

  const existingNames = new Set(shoppingItems.map((i) => i.name.trim().toLowerCase()))

  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const ing of ingredients) {
      if (!existingNames.has(ing.name.trim().toLowerCase())) {
        initial.add(ing.id)
      }
    }
    return initial
  })
  const [loading, setLoading] = useState(false)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(ingredients.map((i) => i.id)))
  }

  function selectNone() {
    setSelected(new Set())
  }

  const allSelected = ingredients.length > 0 && selected.size === ingredients.length
  const noneSelected = selected.size === 0

  const [error, setError] = useState('')

  async function handleAdd() {
    const toAdd = ingredients.filter((i) => selected.has(i.id))
    if (toAdd.length === 0) return
    setLoading(true)
    setError('')
    try {
      await onAdd(toAdd)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt')
      setLoading(false)
    }
  }

  if (ingredients.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onClose}>
        <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-1" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {meal.name} <span className="font-normal text-slate-400">· {DAY_NAMES[dayIndex]} {d.getDate()}.</span>
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 py-2">Denne middagen har ingen ingredienser registrert.</p>
          <button onClick={onClose} className="text-sm text-slate-500 dark:text-slate-400 font-medium py-2.5 rounded-xl active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            Lukk
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onClose}>
      <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 pt-4 pb-3 shrink-0">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {meal.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {DAY_NAMES[dayIndex]} {d.getDate()}. · Legg til i handleliste
              </p>
            </div>
            <button
              onClick={allSelected ? selectNone : selectAll}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 active:bg-indigo-100 dark:active:bg-indigo-900/50 transition-colors"
            >
              {allSelected ? 'Fjern alle' : 'Velg alle'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-2">
          <div className="flex flex-col gap-1.5">
            {ingredients.map((ing) => {
              const alreadyInList = existingNames.has(ing.name.trim().toLowerCase())
              const isSelected = selected.has(ing.id)
              return (
                <button
                  key={ing.id}
                  onClick={() => toggle(ing.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-left border-2 transition-colors ${
                    isSelected
                      ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                    {ing.name}
                    {ing.quantity ? <span className="text-slate-400 dark:text-slate-500 font-normal"> · {ing.quantity}</span> : null}
                  </span>
                  {alreadyInList && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full shrink-0">
                      Allerede lagt til
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-4 pt-3 pb-5 flex flex-col gap-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
          {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={noneSelected || loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 active:bg-indigo-700 transition-colors"
          >
            {loading ? 'Legger til…' : `Legg til ${selected.size} vare${selected.size !== 1 ? 'r' : ''}`}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 dark:text-slate-400 font-medium py-2 rounded-xl active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
