import { useEffect, useRef, useState } from 'react'
import { MealCard } from './MealCard'
import { MealForm } from './MealForm'
import { fetchMatpratRecipe } from '../../lib/matprat'
import type { Meal, MealIngredient, ShoppingCategory } from '../../types'
import type { SaveIngredient } from './useMeals'

interface ImportedData {
  name: string
  category: string
  ingredients: Array<{ name: string; quantity: string }>
  sourceUrl: string
}

interface Props {
  meals: Meal[]
  ingredients: MealIngredient[]
  categories: ShoppingCategory[]
  onCreateMeal: (name: string, desc: string, category: string, ings: SaveIngredient[], sourceUrl?: string) => void
  onUpdateMeal: (id: string, name: string, desc: string, category: string, ings: SaveIngredient[]) => void
  onDeleteMeal: (id: string) => void
  onSelectMeal: (mealId: string) => void
}

export function MealLibrary({ meals, ingredients, categories, onCreateMeal, onUpdateMeal, onDeleteMeal, onSelectMeal }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [editVisible, setEditVisible] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const [showImport, setShowImport] = useState(false)
  const [importVisible, setImportVisible] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState('')
  const [importedData, setImportedData] = useState<ImportedData | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showForm) {
      const t = setTimeout(() => setFormVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setFormVisible(false)
    }
  }, [showForm])

  useEffect(() => {
    if (editingMeal) {
      const t = setTimeout(() => setEditVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setEditVisible(false)
    }
  }, [editingMeal])

  useEffect(() => {
    if (showImport) {
      const t = setTimeout(() => {
        setImportVisible(true)
        importInputRef.current?.focus()
      }, 10)
      return () => clearTimeout(t)
    } else {
      setImportVisible(false)
    }
  }, [showImport])

  function openCreate() { setShowForm(true) }

  function closeCreate() {
    setFormVisible(false)
    setTimeout(() => setShowForm(false), 200)
  }

  function closeEdit() {
    setEditVisible(false)
    setTimeout(() => setEditingMeal(null), 200)
  }

  function openImport() { setShowImport(true); setImportError('') }

  function closeImport() {
    setImportVisible(false)
    setTimeout(() => { setShowImport(false); setImportUrl('') }, 200)
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!importUrl.trim()) return
    setImportLoading(true)
    setImportError('')
    try {
      const data = await fetchMatpratRecipe(importUrl.trim())
      setImportedData(data)
      closeImport()
      setTimeout(() => openCreate(), 220)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Noe gikk galt')
    } finally {
      setImportLoading(false)
    }
  }

  const usedCategories = [...new Set(meals.map((m) => m.category).filter(Boolean))]
  const filteredMeals = categoryFilter ? meals.filter((m) => m.category === categoryFilter) : meals

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.09em] text-text3">Middagsbibliotek</h3>
        <button
          onClick={openImport}
          className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold active:opacity-60 transition-opacity"
        >
          Importer fra Matprat
        </button>
      </div>

      {usedCategories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 no-scrollbar">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              !categoryFilter
                ? 'bg-accent text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700'
            }`}
          >
            Alle
          </button>
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-accent text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filteredMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            ingredients={ingredients.filter((i) => i.meal === meal.id)}
            onEdit={() => { setEditingMeal(meal); setShowForm(false) }}
            onDelete={() => onDeleteMeal(meal.id)}
            onTap={() => onSelectMeal(meal.id)}
          />
        ))}
        {filteredMeals.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-300 dark:text-slate-600">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v4a2 2 0 002 2h3zm0 0v7" />
            </svg>
            <p className="text-sm font-medium">{categoryFilter ? `Ingen ${categoryFilter}-middager` : 'Ingen middager ennå'}</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light active:opacity-80 transition-opacity"
        aria-label="Legg til middag"
      >
        +
      </button>

      {/* Importer fra Matprat — bunn-sheet */}
      {showImport && (
        <div
          className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${importVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeImport}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className={`relative w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl transition-transform duration-300 ${importVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1" />
            <div className="px-5 pt-3 pb-10">
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1 text-base">Importer fra Matprat</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Lim inn lenken til en oppskrift på matprat.no</p>
              <form onSubmit={handleImport} className="flex flex-col gap-3">
                <input
                  ref={importInputRef}
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.matprat.no/oppskrifter/..."
                  required
                  className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {importError && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">{importError}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={closeImport}
                    className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4 py-2 rounded-xl active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={importLoading}
                    className="text-sm bg-indigo-600 text-white rounded-xl px-5 py-2 font-semibold shadow-xs active:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {importLoading ? 'Henter…' : 'Hent oppskrift'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ny middag — bunn-sheet */}
      {showForm && (
        <div
          className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${formVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeCreate}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className={`relative w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl transition-transform duration-300 ${formVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1" />
            <div className="overflow-y-auto max-h-[85vh] px-5 pt-3 pb-10">
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-4 text-base">Ny middag</p>
              <MealForm
                categories={categories}
                initialData={importedData ?? undefined}
                onSave={(name, desc, category, ings) => {
                  onCreateMeal(name, desc, category, ings, importedData?.sourceUrl)
                  closeCreate()
                  setImportedData(null)
                }}
                onCancel={() => { closeCreate(); setImportedData(null) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rediger middag — bunn-sheet */}
      {editingMeal && (
        <div
          className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${editVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeEdit}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className={`relative w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl transition-transform duration-300 ${editVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-1" />
            <div className="overflow-y-auto max-h-[85vh] px-5 pt-3 pb-10">
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-4 text-base">Rediger middag</p>
              <MealForm
                meal={editingMeal}
                existingIngredients={ingredients.filter((i) => i.meal === editingMeal.id)}
                categories={categories}
                onSave={(name, desc, category, ings) => { onUpdateMeal(editingMeal.id, name, desc, category, ings); closeEdit() }}
                onCancel={closeEdit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
