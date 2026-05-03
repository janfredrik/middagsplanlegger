import { useUser } from '../context/UserContext'
import { useAccent } from '../context/AccentContext'
import { Avatar } from './Avatar'

export type Tab = 'shopping' | 'meals'

interface LayoutProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
  children: React.ReactNode
}

function ShoppingIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function CartIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h1.5l2.5 11h11l3-8H6.5" />
      <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function MealsIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 00-5 5v4a2 2 0 002 2h3zm0 0v7" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'shopping', label: 'Handleliste', icon: <ShoppingIcon /> },
  { id: 'meals',    label: 'Middag',      icon: <MealsIcon /> },
]

export function Layout({ tab, onTabChange, children }: LayoutProps) {
  const { currentUser, clearUser } = useUser()
  const { dark, setDark } = useAccent()

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-black/[0.06] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center shadow-xs text-white">
            <CartIcon className="w-5 h-5" />
          </div>
          <span className="text-base font-semibold text-text1 tracking-tight">Middagsplanlegger</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text3 active:bg-surface2 transition-colors"
            title={dark ? 'Lys modus' : 'Mørk modus'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          {currentUser && (
            <button onClick={clearUser} className="flex items-center gap-2 rounded-full" title="Bytt bruker">
              <span className="text-sm text-text3 font-medium">{currentUser.name}</span>
              <Avatar name={currentUser.name} color={currentUser.avatar_color} size="sm" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto main-safe-pb">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-10 bg-card/90 backdrop-blur-md border-t border-black/[0.06] nav-safe-pb">
        <div className="flex">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`relative flex-1 flex flex-col items-center gap-1 pt-3 pb-2 transition-colors duration-150 ${
                  active
                    ? 'text-accent'
                    : 'text-text3 active:text-text2'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-accent" />
                )}
                <span className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                  {t.icon}
                </span>
                <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
