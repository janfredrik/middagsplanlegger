export interface BaseRecord {
  id: string
  created: string
  updated: string
  collectionId: string
  collectionName: string
}

export interface FamilyMember extends BaseRecord {
  name: string
  avatar_color: string
  email?: string
}

export interface ShoppingCategory extends BaseRecord {
  name: string
  emoji: string
  sort_order: number
}

export interface ShoppingItem extends BaseRecord {
  name: string
  quantity: string
  checked: boolean
  category: string
  added_by: string
  tags?: string[]
  expand?: {
    category?: ShoppingCategory
    added_by?: FamilyMember
  }
}

export interface Meal extends BaseRecord {
  name: string
  description: string
  category: string
  source_url?: string
}

export interface MealIngredient extends BaseRecord {
  meal: string
  name: string
  quantity: string
  category: string
  expand?: {
    meal?: Meal
    category?: ShoppingCategory
  }
}

export interface MealPlan extends BaseRecord {
  date: string
  meal: string
  expand?: {
    meal?: Meal
  }
}
