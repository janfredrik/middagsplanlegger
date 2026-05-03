import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

const VERSION_KEY = 'app_version'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
})

async function checkForUpdate() {
  const stored = localStorage.getItem(VERSION_KEY)
  let current: string | null = null

  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      current = data.version
    }
  } catch {
    return
  }

  if (current && current !== stored) {
    if (stored) {
      if (confirm('En ny versjon er tilgjengelig. Vil du laste den inn nå?')) {
        localStorage.setItem(VERSION_KEY, current)
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          await reg.unregister()
        }
        window.location.href = '/?_t=' + Date.now()
        return
      }
    }
    localStorage.setItem(VERSION_KEY, current)
  }
}

checkForUpdate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
