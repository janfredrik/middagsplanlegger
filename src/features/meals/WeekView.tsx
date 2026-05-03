import type { Meal, MealPlan } from '../../types'
import { DaySlot } from './DaySlot'

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']

function weekLabel(weekDates: string[]): string {
  const first = new Date(weekDates[0] + 'T12:00:00')
  const last = new Date(weekDates[6] + 'T12:00:00')
  const d1 = first.getDate()
  const d2 = last.getDate()
  const m1 = MONTHS[first.getMonth()]
  const m2 = MONTHS[last.getMonth()]
  if (first.getMonth() === last.getMonth()) return `${d1}.–${d2}. ${m1}`
  return `${d1}. ${m1} – ${d2}. ${m2}`
}

interface Props {
  weekDates: string[]
  weekOffset: number
  mealPlan: MealPlan[]
  meals: Meal[]
  onPrevWeek: () => void
  onNextWeek: () => void
  onGoToCurrentWeek: () => void
  onRemove: (date: string) => void
  onExportDay: (date: string) => void
  // onExportWeek: () => void
  onAssign: (date: string, mealId: string) => void
}

export function WeekView({
  weekDates, weekOffset, mealPlan, meals,
  onPrevWeek, onNextWeek, onGoToCurrentWeek,
  onRemove, onExportDay, onAssign,
}: Props) {
  const usedMealIds = new Map(
    mealPlan
      .filter(mp => weekDates.includes(mp.date.slice(0, 10)))
      .map(mp => [mp.date.slice(0, 10), mp.meal])
  )

  const label = weekOffset === 0
    ? 'Denne uken'
    : weekOffset === 1
    ? 'Neste uke'
    : weekOffset === -1
    ? 'Forrige uke'
    : weekOffset > 0
    ? `Om ${weekOffset} uker`
    : `${Math.abs(weekOffset)} uker siden`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 active:bg-slate-100 dark:active:bg-slate-800 transition-colors shrink-0"
          aria-label="Forrige uke"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center min-w-0">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
            {label}
          </span>
          <span className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">
            {weekLabel(weekDates)}
          </span>
        </div>

        <button
          onClick={onNextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 active:bg-slate-100 dark:active:bg-slate-800 transition-colors shrink-0"
          aria-label="Neste uke"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {weekOffset !== 0 && (
        <button
          onClick={onGoToCurrentWeek}
          className="self-center text-xs text-indigo-600 dark:text-indigo-400 font-medium px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 active:bg-indigo-100 dark:active:bg-indigo-900/50 transition-colors -mt-1"
        >
          Gå til denne uken
        </button>
      )}

      {/* <div className="flex items-center justify-end">
        <button
          onClick={onExportWeek}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-2.5 py-1.5 active:bg-indigo-100 dark:active:bg-indigo-900/50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Legg til hele uken
        </button>
      </div> */}

      <div className="grid grid-cols-2 gap-2">
        {weekDates.map((date) => {
          const plan = mealPlan.find((mp) => mp.date.slice(0, 10) === date)
          const meal = plan ? meals.find((m) => m.id === plan.meal) : undefined
          const otherDayMealIds = new Set(
            [...usedMealIds.entries()]
              .filter(([d]) => d !== date)
              .map(([, id]) => id)
          )
          const availableMeals = meals.filter(m => !otherDayMealIds.has(m.id))
          return (
            <DaySlot
              key={date}
              date={date}
              meal={meal}
              availableMeals={availableMeals}
              onRemove={() => onRemove(date)}
              onExport={() => onExportDay(date)}
              onAssign={(mealId) => onAssign(date, mealId)}
            />
          )
        })}
      </div>
    </div>
  )
}
