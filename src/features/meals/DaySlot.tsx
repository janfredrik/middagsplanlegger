import { useState, useEffect, useRef } from 'react'
import type { Meal } from '../../types'

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

interface Props {
  date: string
  meal: Meal | undefined
  availableMeals: Meal[]
  onRemove: () => void
  onExport: () => void
  onAssign: (mealId: string) => void
}

export function DaySlot({ date, meal, availableMeals, onRemove, onExport, onAssign }: Props) {
  const d = new Date(date + 'T12:00:00')
  const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today
  const isPast = date < today

  const [triedIds, setTriedIds] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!meal) setTriedIds([])
  }, [meal])

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000)
    } else {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
      setConfirmDelete(false)
      onRemove()
    }
  }

  useEffect(() => () => { if (confirmTimer.current) clearTimeout(confirmTimer.current) }, [])

  function handleSuggest() {
    const exclude = new Set([...triedIds, meal?.id].filter(Boolean) as string[])
    let pool = availableMeals.filter(m => !exclude.has(m.id))
    if (pool.length === 0) {
      pool = availableMeals.filter(m => m.id !== meal?.id)
      if (pool.length === 0) return
      setTriedIds([])
    }
    const pick = pool[Math.floor(Math.random() * pool.length)]
    setTriedIds(prev => [...prev, pick.id])
    onAssign(pick.id)
  }

  return (
    <div
      className={`rounded-2xl p-3 min-h-[76px] flex flex-col gap-1.5 border-2 transition-all duration-150 ${
        isToday
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-200/60 dark:ring-indigo-700/40'
          : isPast
          ? 'border-slate-100 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/20 opacity-50'
          : meal
          ? 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/40'
          : 'border-dashed border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
          {DAY_NAMES[dayIndex]} {d.getDate()}.{isToday && <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">i dag</span>}
        </span>
        <div className="flex gap-1">
          {availableMeals.length > 0 && !meal && (
            <button
              onClick={handleSuggest}
              title="Foreslå tilfeldig middag"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 active:text-indigo-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/>
                <line x1="15" y1="15" x2="21" y2="21"/>
              </svg>
            </button>
          )}
          {meal && (
            <>
              <button
                onClick={onExport}
                title="Legg til i handleliste"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 active:text-indigo-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                title={confirmDelete ? 'Trykk igjen for å bekrefte' : 'Fjern middag'}
                className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                  confirmDelete
                    ? 'text-red-400 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                    : 'text-slate-300 dark:text-slate-600 active:text-red-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {meal
        ? <p className={`text-sm font-semibold leading-tight ${isPast ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{meal.name}</p>
        : <p className="text-xs text-slate-300 dark:text-slate-600 italic font-medium">Trykk på en middag for å legge til</p>
      }
    </div>
  )
}
