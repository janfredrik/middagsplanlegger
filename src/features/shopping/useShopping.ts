import { useEffect, useState } from 'react'
import { pb } from '../../lib/pb'
import type { ShoppingCategory, ShoppingItem } from '../../types'

export function useShopping() {
  const [categories, setCategories] = useState<ShoppingCategory[]>([])
  const [items, setItems] = useState<ShoppingItem[]>([])

  useEffect(() => {
    pb.collection('shopping_categories')
      .getFullList<ShoppingCategory>({ sort: 'sort_order', requestKey: null })
      .then(setCategories)

    pb.collection('shopping_items')
      .getFullList<ShoppingItem>({ sort: 'created', requestKey: null })
      .then(setItems)

    pb.collection('shopping_items').subscribe<ShoppingItem>('*', (e) => {
      if (e.action === 'create') setItems((p) => [...p, e.record])
      if (e.action === 'update') setItems((p) => p.map((i) => (i.id === e.record.id ? e.record : i)))
      if (e.action === 'delete') setItems((p) => p.filter((i) => i.id !== e.record.id))
    })

    return () => { pb.collection('shopping_items').unsubscribe('*') }
  }, [])

  async function addItem(data: { name: string; quantity: string; category: string; added_by: string; tags?: string[] }) {
    await pb.collection('shopping_items').create({ ...data, checked: false })
  }

  async function toggleItem(item: ShoppingItem) {
    await pb.collection('shopping_items').update(item.id, { checked: !item.checked })
  }

  async function deleteItem(id: string) {
    await pb.collection('shopping_items').delete(id)
  }

  async function updateItem(id: string, data: Partial<Pick<ShoppingItem, 'category' | 'tags'>>) {
    await pb.collection('shopping_items').update(id, data)
  }

  async function clearChecked() {
    const checked = items.filter((i) => i.checked)
    await Promise.all(checked.map((i) => pb.collection('shopping_items').delete(i.id)))
  }

  return { categories, items, addItem, toggleItem, deleteItem, clearChecked, updateItem }
}
