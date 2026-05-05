import { useEffect, useState } from 'react'
import { useShopping } from './useShopping'
import { CategoryGroup } from './CategoryGroup'
import { AddItemForm } from './AddItemForm'
import { ItemContextMenu } from './ItemContextMenu'

export function ShoppingPage() {
  const { categories, items, addItem, toggleItem, deleteItem, clearChecked, updateItem } = useShopping()
  const [contextItemId, setContextItemId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormVisible, setAddFormVisible] = useState(false)

  useEffect(() => {
    if (showAddForm) {
      const t = setTimeout(() => setAddFormVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setAddFormVisible(false)
    }
  }, [showAddForm])

  const contextItem = contextItemId ? (items.find((i) => i.id === contextItemId) ?? null) : null
  const checkedCount = items.filter((i) => i.checked).length
  const categoryIds = new Set(categories.map((c) => c.id))
  const uncategorized = items.filter((i) => !i.category || !categoryIds.has(i.category))

  function handleChangeCategory(categoryId: string) {
    if (!contextItem) return
    updateItem(contextItem.id, { category: categoryId })
  }

  function closeAddForm() {
    setAddFormVisible(false)
    setTimeout(() => setShowAddForm(false), 200)
  }

  return (
    <div className="p-4">
      {checkedCount > 0 && (
        <button
          onClick={clearChecked}
          className="mb-5 flex items-center gap-1.5 text-sm text-red-400 font-semibold active:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
          Fjern {checkedCount} avkryssede
        </button>
      )}
      {categories.map((cat) => (
        <CategoryGroup
          key={cat.id}
          category={cat}
          items={items.filter((i) => i.category === cat.id)}
          onToggle={toggleItem}
          onDelete={deleteItem}
          onLongPress={(item) => setContextItemId(item.id)}
        />
      ))}
      {uncategorized.length > 0 && (
        <CategoryGroup
          key="uncategorized"
          category={{ id: '', name: 'Annet', emoji: '🛒', sort_order: 99, collectionId: '', collectionName: '', created: '', updated: '' }}
          items={uncategorized}
          onToggle={toggleItem}
          onDelete={deleteItem}
          onLongPress={(item) => setContextItemId(item.id)}
        />
      )}
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-slate-300 dark:text-slate-600">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <p className="text-sm font-medium">Handlelisten er tom</p>
        </div>
      )}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-3xl font-light active:bg-indigo-700 transition-colors"
        aria-label="Legg til vare"
      >
        +
      </button>

      {showAddForm && (
        <div
          className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${addFormVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeAddForm}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className={`relative overflow-visible w-full bg-white dark:bg-slate-800 rounded-t-3xl px-5 pt-4 pb-10 shadow-2xl transition-transform duration-300 ${addFormVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <p className="font-semibold text-slate-800 dark:text-slate-100 mb-5 text-base">Legg til vare</p>
            <AddItemForm
              categories={categories}
              onAdd={(data) => { addItem(data); closeAddForm() }}
            />
          </div>
        </div>
      )}

      {contextItem && (
        <ItemContextMenu
          item={contextItem}
          categories={categories}
          onClose={() => setContextItemId(null)}
          onChangeCategory={handleChangeCategory}
        />
      )}
    </div>
  )
}
