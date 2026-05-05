import { useState, useEffect, useRef } from 'react'
import type { Meal, MealIngredient } from '../../types'

interface Props {
  meal: Meal
  ingredients: MealIngredient[]
  onEdit: () => void
  onDelete: () => void
  onTap?: () => void
}

export function MealCard({ meal, ingredients, onEdit, onDelete, onTap }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      onClick={onTap}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/40 select-none transition-colors ${onTap ? 'active:bg-slate-50 dark:active:bg-slate-700/60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{meal.name}</p>
          {meal.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{meal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {meal.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {meal.category}
              </span>
            )}
            {ingredients.length > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{ingredients.length} ingredienser</span>
            )}
            {meal.source_url && (
              <a
                href={meal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-indigo-400 dark:text-indigo-500 font-medium underline-offset-2 hover:underline active:opacity-70"
              >
                Se på Matprat
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 active:bg-indigo-100 dark:active:bg-indigo-900/50 transition-colors"
          >
            Rediger
          </button>
          <button
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Trykk igjen for å bekrefte' : 'Slett'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
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
      </div>
    </div>
  )
}
