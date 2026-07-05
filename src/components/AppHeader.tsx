import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

function MountainLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 30" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 2L5 24h26L18 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M13 14l5-9 5 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M5 24l4-4 4 3 5-4 5 4 4-3 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function ThemeSwitch({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-6 w-11 shrink-0 items-center rounded-full border border-pine/20 bg-pine/8 transition-colors duration-300 ease-premium hover:border-pine/40 dark:border-linen/20 dark:bg-white/10 dark:hover:border-linen/40"
      style={{ background: dark ? 'rgba(85,122,86,0.18)' : 'rgba(26,51,30,0.06)' }}
    >
      {/* Track */}
      <span className="absolute inset-0 rounded-full" />
      {/* Thumb */}
      <span
        className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full shadow-sm transition-[transform,background-color] duration-300 ease-premium ${
          dark
            ? 'translate-x-[22px] bg-pine-muted'
            : 'translate-x-[2px] bg-pine'
        }`}
      >
        {/* Sun rays (light) / Moon crescent (dark) — thin outline SVG */}
        {dark ? (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
            <path
              d="M9.5 6.5A3.5 3.5 0 015 2a4 4 0 100 8 3.5 3.5 0 004.5-3.5z"
              stroke="white"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
            <circle cx="6" cy="6" r="2" stroke="white" strokeWidth="1" />
            <path d="M6 1v1M6 10v1M1 6h1M10 6h1M2.5 2.5l.7.7M8.8 8.8l.7.7M8.8 3.2l-.7.7M3.2 8.8l-.7.7" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        )}
      </span>
    </button>
  )
}

export function AppHeader() {
  const { user, signOut } = useAuth()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('travelsnap-theme')
    const isDark = stored ? stored === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('travelsnap-theme', next ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-pine/10 bg-alabaster/80 backdrop-blur-gallery dark:border-white/5 dark:bg-obsidian/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine text-alabaster">
            <MountainLogo className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-base font-semibold tracking-tight text-pine dark:text-linen">
              TravelSnap
            </span>
            <p className="text-[11px] leading-none text-pine-muted dark:text-linen/60">Your travel bucket list</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <ThemeSwitch dark={dark} onToggle={toggleTheme} />
            <span className="hidden text-sm text-pine-muted sm:inline dark:text-linen/70">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-xl border border-pine/15 bg-transparent px-3 py-1.5 text-xs font-medium text-pine-muted
                transition-[background-color,border-color,color] duration-300 ease-premium
                hover:border-red-300 hover:bg-red-50 hover:text-red-600
                dark:border-linen/15 dark:text-linen/60 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
