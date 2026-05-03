import { useState } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import { AccentProvider } from './context/AccentContext'
import { UserPicker } from './components/UserPicker'
import { Layout, type Tab } from './components/Layout'
import { ShoppingPage } from './features/shopping/ShoppingPage'
import { MealsPage } from './features/meals/MealsPage'

function Inner() {
  const { currentUser } = useUser()
  const [tab, setTab] = useState<Tab>(
    () => (localStorage.getItem('activeTab') as Tab | null) ?? 'shopping'
  )

  const handleTabChange = (next: Tab) => {
    localStorage.setItem('activeTab', next)
    setTab(next)
  }

  if (!currentUser) return <UserPicker />

  return (
    <Layout tab={tab} onTabChange={handleTabChange}>
      {tab === 'shopping' && <ShoppingPage />}
      {tab === 'meals'    && <MealsPage />}
    </Layout>
  )
}

export default function App() {
  return (
    <AccentProvider>
      <UserProvider>
        <Inner />
      </UserProvider>
    </AccentProvider>
  )
}
