import { createContext, useContext, useEffect, useState } from 'react'
import { pb } from '../lib/pb'
import type { FamilyMember } from '../types'

interface UserContextValue {
  currentUser: FamilyMember | null
  members: FamilyMember[]
  setCurrentUser: (user: FamilyMember) => void
  clearUser: () => void
  loading: boolean
  error: string | null
  retry: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

const STORAGE_KEY = 'middagsplanlegger_user_id'

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [currentUser, setCurrentUserState] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)

    pb.collection('family_members')
      .getFullList<FamilyMember>({ sort: 'name', requestKey: null })
      .then((records) => {
        setMembers(records)
        const savedId = localStorage.getItem(STORAGE_KEY)
        if (savedId) {
          const found = records.find((m) => m.id === savedId)
          if (found) { setCurrentUserState(found); setLoading(false); return }
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Kunne ikke koble til serveren')
        setLoading(false)
      })
  }, [retryCount])

  function retry() {
    setRetryCount((c) => c + 1)
  }

  function setCurrentUser(user: FamilyMember) {
    setCurrentUserState(user)
    localStorage.setItem(STORAGE_KEY, user.id)
  }

  function clearUser() {
    setCurrentUserState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <UserContext.Provider value={{ currentUser, members, setCurrentUser, clearUser, loading, error, retry }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
