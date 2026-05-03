import type { Meal, MealPlan } from '../../types'

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']

interface Props {
  meal: Meal
  weekDates: string[]
  weekOffset: number
  mealPlan: MealPlan[]
  meals: Meal[]
  onAssign: (date: string) => void
  onClose: () => void
}

export function DayPickerModal({ meal, weekDates, weekOffset, mealPlan, meals, onAssign, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const weekLabel = weekOffset === 0 ? 'Denne uken' : weekOffset === 1 ? 'Neste uke' : weekOffset === -1 ? 'Forrige uke' : weekOffset > 0 ? `Om ${weekOffset} uker` : `${Math.abs(weekOffset)} uker siden`
  const firstDate = new Date(weekDates[0] + 'T12:00:00')
  const lastDate = new Date(weekDates[6] + 'T12:00:00')
  const dateRange = firstDate.getMonth() === lastDate.getMonth()
    ? `${firstDate.getDate()}.–${lastDate.getDate()}. ${MONTHS[firstDate.getMonth()]}`
    : `${firstDate.getDate()}. ${MONTHS[firstDate.getMonth()]} – ${lastDate.getDate()}. ${MONTHS[lastDate.getMonth()]}`

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-4 flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-1" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Velg dag for{' '}
          <span className="text-indigo-600 dark:text-indigo-400">{meal.name}</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
          {weekLabel} · {dateRange}
        </p>

        {weekDates.map((date) => {
          const d = new Date(date + 'T12:00:00')
          const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
          const isToday = date === today
          const plan = mealPlan.find((mp) => mp.date.slice(0, 10) === date)
          const assignedMeal = plan ? meals.find((m) => m.id === plan.meal) : undefined
          const isThisMeal = plan?.meal === meal.id

          return (
            <button
              key={date}
              onClick={() => { onAssign(date); onClose() }}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-colors text-left border-2 ${
                isThisMeal
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent active:bg-indigo-50 dark:active:bg-indigo-900/20'
              }`}
            >
              <span className={`text-sm font-semibold w-14 shrink-0 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                {DAY_NAMES[dayIndex]} {d.getDate()}.
              </span>
              <span className={`flex-1 text-sm truncate ${assignedMeal ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 italic'}`}>
                {assignedMeal ? assignedMeal.name : 'Tom'}
              </span>
              {isThisMeal && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">Valgt</span>
              )}
            </button>
          )
        })}

        <button
          onClick={onClose}
          className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium py-2.5 rounded-xl active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
