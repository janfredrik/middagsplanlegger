import { useUser } from '../context/UserContext'
import { useAccent, ACCENTS, type AccentKey } from '../context/AccentContext'
import { Avatar } from './Avatar'

const ACCENT_OPTIONS: { key: AccentKey; color: string }[] = [
  { key: 'green',  color: '#10b981' },
  { key: 'blue',   color: '#0ea5e9' },
  { key: 'violet', color: '#8b5cf6' },
  { key: 'orange', color: '#f97316' },
  { key: 'rose',   color: '#f43f5e' },
]

export function UserPicker() {
  const { members, setCurrentUser, loading, error, retry } = useUser()
  const { accent, dark, setAccent, setDark } = useAccent()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-text3 text-sm font-medium">Laster...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-text1 text-base text-center">{error}. Prøv igjen.</p>
        <button
          onClick={retry}
          className="bg-accent text-white text-sm rounded-[14px] px-6 py-2.5 font-semibold shadow-xs active:opacity-80 transition-opacity"
        >
          Prøv igjen
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 p-8 overflow-y-auto">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-[20px] flex items-center justify-center"
          style={{
            background: ACCENTS[accent].color,
            boxShadow: `0 8px 24px ${ACCENTS[accent].shadow}`,
          }}
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 00-5 5v4a2 2 0 002 2h3zm0 0v7" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-[22px] font-extrabold text-text1 tracking-tight">Middagsplanlegger</h1>
          <p className="text-[13px] text-text3 font-medium mt-1">Hvem er du?</p>
        </div>
      </div>

      {/* Settings card */}
      <div className="w-full max-w-xs bg-card rounded-card border border-black/[0.07] p-4 flex flex-col gap-3.5">
        {/* Accent colours */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-text3 mb-2.5">Aksentfarge</p>
          <div className="flex gap-2 justify-between">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAccent(opt.key)}
                title={opt.key}
                className="w-[34px] h-[34px] rounded-full transition-all shrink-0"
                style={{
                  background: opt.color,
                  border: accent === opt.key ? `3px solid var(--color-text1)` : '3px solid transparent',
                  boxShadow: accent === opt.key ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${opt.color}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-black/[0.07]" />

        {/* Dark mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-text1">
            {dark ? 'Mørk modus' : 'Lys modus'}
          </span>
          <button
            onClick={() => setDark(!dark)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ background: dark ? ACCENTS[accent].color : 'var(--color-surface2)' }}
          >
            <span
              className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200"
              style={{ left: dark ? '22px' : '3px' }}
            />
          </button>
        </div>
      </div>

      {/* Member list */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => setCurrentUser(member)}
            className="flex items-center gap-4 p-4 rounded-[18px] bg-card border border-black/[0.07] active:scale-[0.97] transition-all shadow-card"
          >
            <Avatar name={member.name} color={member.avatar_color} />
            <span className="text-[15px] font-bold text-text1 flex-1 text-left">{member.name}</span>
            <svg className="w-4 h-4 text-text3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-text3 text-center font-medium">Velg brukeren din for å fortsette</p>
    </div>
  )
}
