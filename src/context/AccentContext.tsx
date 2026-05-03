import { createContext, useContext, useLayoutEffect, useState } from 'react'

export const ACCENTS = {
  green:  { color: '#10b981', soft: '#d1fae5', softDark: 'rgba(16,185,129,0.18)',  shadow: 'rgba(16,185,129,0.28)' },
  blue:   { color: '#0ea5e9', soft: '#e0f2fe', softDark: 'rgba(14,165,233,0.18)',  shadow: 'rgba(14,165,233,0.28)' },
  violet: { color: '#8b5cf6', soft: '#ede9fe', softDark: 'rgba(139,92,246,0.18)', shadow: 'rgba(139,92,246,0.28)' },
  orange: { color: '#f97316', soft: '#ffedd5', softDark: 'rgba(249,115,22,0.18)', shadow: 'rgba(249,115,22,0.28)' },
  rose:   { color: '#f43f5e', soft: '#ffe4e6', softDark: 'rgba(244,63,94,0.18)',  shadow: 'rgba(244,63,94,0.28)'  },
} as const

export type AccentKey = keyof typeof ACCENTS

interface AccentCtx {
  accent: AccentKey
  dark: boolean
  setAccent: (a: AccentKey) => void
  setDark: (d: boolean) => void
}

const Ctx = createContext<AccentCtx | null>(null)

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentKey>(
    () => (localStorage.getItem('fp-accent') as AccentKey | null) ?? 'green'
  )
  const [dark, setDarkState] = useState(() => {
    const saved = localStorage.getItem('fp-dark')
    if (saved !== null) return saved === 'true'
    const legacy = localStorage.getItem('fp_theme')
    if (legacy !== null) return legacy === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useLayoutEffect(() => {
    const a = ACCENTS[accent]
    const root = document.documentElement
    root.style.setProperty('--color-accent', a.color)
    root.style.setProperty('--color-accent-soft', dark ? a.softDark : a.soft)
    root.style.setProperty('--color-accent-shadow', a.shadow)
    root.setAttribute('data-theme', dark ? 'dark' : 'light')
    root.style.colorScheme = dark ? 'dark' : 'light'
    localStorage.setItem('fp-accent', accent)
    localStorage.setItem('fp-dark', String(dark))
  }, [accent, dark])

  return (
    <Ctx.Provider value={{ accent, dark, setAccent: setAccentState, setDark: setDarkState }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAccent() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAccent must be used inside AccentProvider')
  return ctx
}
