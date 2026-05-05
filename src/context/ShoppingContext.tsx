import { createContext, useContext } from 'react'
import { useShopping } from '../features/shopping/useShopping'

type ShoppingContextValue = ReturnType<typeof useShopping>

const ShoppingContext = createContext<ShoppingContextValue | null>(null)

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const value = useShopping()
  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>
}

export function useShoppingContext() {
  const ctx = useContext(ShoppingContext)
  if (!ctx) throw new Error('useShoppingContext must be used within ShoppingProvider')
  return ctx
}
