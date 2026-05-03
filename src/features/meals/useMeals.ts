import { useEffect, useState } from 'react'
import { pb } from '../../lib/pb'
import type { Meal, MealIngredient, MealPlan, ShoppingCategory } from '../../types'

function isoDate(d: Date) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function weekBounds(offsetWeeks: number) {
  const now = new Date()
  const day = now.getDay() || 7
  const mon = new Date(now)
  mon.setDate(now.getDate() - day + 1 + offsetWeeks * 7)
  const nextMon = new Date(mon)
  nextMon.setDate(mon.getDate() + 7)
  return { from: isoDate(mon), to: isoDate(nextMon) }
}

export type SaveIngredient = Omit<MealIngredient, 'id' | 'meal' | 'created' | 'updated' | 'collectionId' | 'collectionName'>

export function useMeals(currentUserId: string, weekOffset: number) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [ingredients, setIngredients] = useState<MealIngredient[]>([])
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([])
  const [categories, setCategories] = useState<ShoppingCategory[]>([])

  useEffect(() => {
    pb.collection('meals').getFullList<Meal>({ sort: 'name', requestKey: null }).then(setMeals)
    pb.collection('meal_ingredients').getFullList<MealIngredient>({ requestKey: null }).then(setIngredients)
    pb.collection('shopping_categories').getFullList<ShoppingCategory>({ sort: 'sort_order', requestKey: null }).then(setCategories)

    pb.collection('meals').subscribe<Meal>('*', (e) => {
      if (e.action === 'create') setMeals((p) => [...p, e.record].sort((a, b) => a.name.localeCompare(b.name)))
      if (e.action === 'update') setMeals((p) => p.map((m) => (m.id === e.record.id ? e.record : m)))
      if (e.action === 'delete') setMeals((p) => p.filter((m) => m.id !== e.record.id))
    })
    pb.collection('meal_ingredients').subscribe<MealIngredient>('*', (e) => {
      if (e.action === 'create') setIngredients((p) => p.some((i) => i.id === e.record.id) ? p : [...p, e.record])
      if (e.action === 'update') setIngredients((p) => p.map((i) => (i.id === e.record.id ? e.record : i)))
      if (e.action === 'delete') setIngredients((p) => p.filter((i) => i.id !== e.record.id))
    })
    pb.collection('meal_plan').subscribe<MealPlan>('*', (e) => {
      if (e.action === 'create') setMealPlan((p) => [...p, e.record])
      if (e.action === 'update') setMealPlan((p) => p.map((mp) => (mp.id === e.record.id ? e.record : mp)))
      if (e.action === 'delete') setMealPlan((p) => p.filter((mp) => mp.id !== e.record.id))
    })

    return () => {
      pb.collection('meals').unsubscribe('*')
      pb.collection('meal_ingredients').unsubscribe('*')
      pb.collection('meal_plan').unsubscribe('*')
    }
  }, [])

  useEffect(() => {
    const { from, to } = weekBounds(weekOffset)
    pb.collection('meal_plan')
      .getFullList<MealPlan>({ filter: `date >= "${from}" && date < "${to}"`, requestKey: null })
      .then(setMealPlan)
  }, [weekOffset])

  async function createMeal(name: string, description: string, category: string): Promise<Meal> {
    return pb.collection('meals').create<Meal>({ name, description, category })
  }

  async function updateMeal(id: string, name: string, description: string, category: string) {
    await pb.collection('meals').update(id, { name, description, category })
  }

  async function deleteMeal(id: string) {
    const toDelete = await pb.collection('meal_ingredients').getFullList<MealIngredient>({ filter: `meal = "${id}"` })
    await Promise.all(toDelete.map((i) => pb.collection('meal_ingredients').delete(i.id)))
    await pb.collection('meals').delete(id)
  }

  async function saveIngredients(mealId: string, newIngredients: SaveIngredient[]) {
    const existing = ingredients.filter((i) => i.meal === mealId)
    for (const i of existing) {
      await pb.collection('meal_ingredients').delete(i.id)
    }
    const created: MealIngredient[] = []
    for (const ing of newIngredients) {
      const data: Record<string, string> = { name: ing.name, quantity: ing.quantity, meal: mealId }
      if (ing.category) data.category = ing.category
      const record = await pb.collection('meal_ingredients').create<MealIngredient>(data)
      created.push(record)
    }
    setIngredients((prev) => [...prev.filter((i) => i.meal !== mealId), ...created])
  }

  async function assignMealToDay(date: string, mealId: string) {
    const existing = mealPlan.find((mp) => mp.date.slice(0, 10) === date)
    if (existing) {
      await pb.collection('meal_plan').update(existing.id, { meal: mealId })
    } else {
      await pb.collection('meal_plan').create({ date, meal: mealId })
    }
  }

  async function removeMealFromDay(date: string) {
    const existing = mealPlan.find((mp) => mp.date.slice(0, 10) === date)
    if (existing) await pb.collection('meal_plan').delete(existing.id)
  }

  async function addIngredientsToShoppingList(ings: MealIngredient[]) {
    await Promise.all(
      ings.map((ing) => {
        const data: Record<string, unknown> = {
          name: ing.name,
          quantity: ing.quantity ?? '',
          checked: false,
          added_by: currentUserId,
        }
        if (ing.category) data.category = ing.category
        return pb.collection('shopping_items').create(data, { requestKey: ing.id })
      })
    )
  }

  async function exportToShoppingList(dates: string[]) {
    const plannedMealIds = mealPlan.filter((mp) => dates.includes(mp.date.slice(0, 10))).map((mp) => mp.meal)
    if (plannedMealIds.length === 0) return
    const filter = plannedMealIds.map((id) => `meal = "${id}"`).join(' || ')
    const relevant = await pb.collection('meal_ingredients').getFullList<MealIngredient>({ filter })
    await Promise.all(
      relevant.map((ing) => {
        const data: Record<string, unknown> = {
          name: ing.name,
          quantity: ing.quantity ?? '',
          checked: false,
          added_by: currentUserId,
        }
        if (ing.category) data.category = ing.category
        return pb.collection('shopping_items').create(data, { requestKey: ing.id })
      })
    )
  }

  return {
    meals, ingredients, mealPlan, categories,
    createMeal, updateMeal, deleteMeal, saveIngredients,
    assignMealToDay, removeMealFromDay, exportToShoppingList, addIngredientsToShoppingList,
  }
}

export function getWeekDates(offsetWeeks = 0): string[] {
  const dates: string[] = []
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offsetWeeks * 7)
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(isoDate(d))
  }
  return dates
}
