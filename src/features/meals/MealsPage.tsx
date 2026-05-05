import { useMemo, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useMeals, getWeekDates } from './useMeals'
import type { SaveIngredient } from './useMeals'
import { useShopping } from '../shopping/useShopping'
import { MealLibrary } from './MealLibrary'
import { WeekView } from './WeekView'
import { DayPickerModal } from './DayPickerModal'
import { IngredientsExportModal } from './IngredientsExportModal'

export function MealsPage() {
  const { currentUser } = useUser()
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])

  const {
    meals, ingredients, mealPlan, categories,
    createMeal, updateMeal, deleteMeal, saveIngredients,
    assignMealToDay, removeMealFromDay, /*exportToShoppingList,*/ addIngredientsToShoppingList,
  } = useMeals(currentUser?.id ?? '', weekOffset)

  const { items: shoppingItems } = useShopping()

  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)
  const selectedMeal = meals.find(m => m.id === selectedMealId)

  const [exportDay, setExportDay] = useState<string | null>(null)
  const exportMeal = exportDay
    ? meals.find(m => m.id === mealPlan.find(mp => mp.date.slice(0, 10) === exportDay)?.meal)
    : undefined
  const exportIngredients = exportMeal
    ? ingredients.filter(i => i.meal === exportMeal.id)
    : []

  async function handleCreateMeal(name: string, desc: string, category: string, ings: SaveIngredient[], sourceUrl?: string) {
    const meal = await createMeal(name, desc, category, sourceUrl)
    if (ings.length > 0) await saveIngredients(meal.id, ings)
  }

  async function handleUpdateMeal(id: string, name: string, desc: string, category: string, ings: SaveIngredient[]) {
    await updateMeal(id, name, desc, category)
    await saveIngredients(id, ings)
  }

  return (
    <>
      <div className="p-4 flex flex-col gap-6">
        <WeekView
          weekDates={weekDates}
          weekOffset={weekOffset}
          mealPlan={mealPlan}
          meals={meals}
          onPrevWeek={() => setWeekOffset(o => o - 1)}
          onNextWeek={() => setWeekOffset(o => o + 1)}
          onGoToCurrentWeek={() => setWeekOffset(0)}
          onRemove={removeMealFromDay}
          onExportDay={(date) => setExportDay(date)}
          // onExportWeek={() => exportToShoppingList(weekDates)}
          onAssign={assignMealToDay}
        />
        <MealLibrary
          meals={meals}
          ingredients={ingredients}
          categories={categories}
          onCreateMeal={handleCreateMeal}
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={deleteMeal}
          onSelectMeal={setSelectedMealId}
        />
      </div>
      {exportDay && exportMeal && (
        <IngredientsExportModal
          meal={exportMeal}
          date={exportDay}
          ingredients={exportIngredients}
          shoppingItems={shoppingItems}
          onAdd={addIngredientsToShoppingList}
          onClose={() => setExportDay(null)}
        />
      )}
      {selectedMeal && (
        <DayPickerModal
          meal={selectedMeal}
          weekDates={weekDates}
          weekOffset={weekOffset}
          mealPlan={mealPlan}
          meals={meals}
          onAssign={(date) => assignMealToDay(date, selectedMeal.id)}
          onClose={() => setSelectedMealId(null)}
        />
      )}
    </>
  )
}
