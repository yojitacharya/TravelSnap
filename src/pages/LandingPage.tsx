import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LANDSCAPE_IMAGES } from '../lib/landscapeImages'
import { useAuth } from '../context/AuthContext'

// Extra verified Unsplash photos for the landing page
const EXTRA_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    caption: 'City lights at night',
  },
  {
    url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80',
    caption: 'Tropical coastlines',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    caption: 'Crystal clear waters',
  },
  {
    url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
    caption: 'European architecture',
  },
  {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    caption: 'Desert sand dunes',
  },
  {
    url: 'https://images.unsplash.com/photo-1519922639192-e73293ca430e?w=1200&q=80',
    caption: 'Northern wilderness',
  },
]

const ALL_IMAGES = [...LANDSCAPE_IMAGES, ...EXTRA_IMAGES]

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-alabaster">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine/20 border-t-pine" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch {
      setError('Sign in failed. Please try again.')
      setSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-alabaster">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        <img
          src={ALL_IMAGES[0].url}
          alt=""
          onLoad={() => setHeroLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/55 via-obsidian/30 to-obsidian/85" />

        <div className="relative z-10 flex flex-col items-center px-4 text-center">
          {/* Mountain logo */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <svg viewBox="0 0 36 30" fill="none" className="h-9 w-9" aria-hidden="true">
              <path d="M18 2L6 22h24L18 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="white" fillOpacity="0.15"/>
              <path d="M8 22L2 28h32l-6-6-7 4-7-4-6 6" stroke="white" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
              <path d="M14 12l4-7 4 7" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="white" fillOpacity="0.25"/>
            </svg>
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            TravelSnap
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/80 sm:text-xl">
            Your personal travel bucket list. Plan where you want to go, track where you've been.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={signingIn}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-charcoal shadow-lg transition-[transform,opacity] duration-300 ease-premium hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              <GoogleIcon />
              {signingIn ? 'Redirecting…' : 'Continue with Google'}
            </button>
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-red-900/60 px-4 py-2 text-sm text-red-200">{error}</p>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── Mosaic strip — no captions ───────────────────────────────── */}
      <section className="overflow-hidden bg-obsidian">
        <div className="flex h-64 sm:h-80 lg:h-96">
          {ALL_IMAGES.slice(1, 6).map((img, i) => (
            <div key={i} className="relative min-w-0 flex-1 overflow-hidden">
              <img
                src={img.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover brightness-90 transition-transform duration-700 ease-premium hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="bg-alabaster py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-pine sm:text-4xl">
              Everything your bucket list needs
            </h2>
            <p className="mt-3 text-pine-muted">From the dream to the memory — TravelSnap keeps it all.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Build your list',
                desc: 'Add destinations, mark them as visited, and track every place you dream of visiting.',
              },
              {
                title: 'Plan every spot',
                desc: 'Add places of interest inside each destination with AI-powered suggestions to inspire you.',
              },
              {
                title: 'Relive memories',
                desc: 'Upload photos from each trip — your Memory Vault turns visited destinations into a gallery.',
              },
            ].map((feat) => (
              <div key={feat.title} className="rounded-2xl border border-pine/10 bg-white/60 p-6 backdrop-blur-gallery">
                <h3 className="font-display text-lg font-semibold text-pine">{feat.title}</h3>
                <p className="mt-2 text-sm text-pine-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wide quote landscape ─────────────────────────────────────── */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={ALL_IMAGES[6].url}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/75 via-obsidian/35 to-transparent" />
        <div className="relative flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
          <blockquote className="max-w-xl">
            <p className="font-display text-2xl font-semibold text-white sm:text-3xl leading-snug">
              "The world is a book, and those who do not travel read only one page."
            </p>
            <footer className="mt-4 text-sm text-white/55">— Saint Augustine</footer>
          </blockquote>
        </div>
      </section>

      {/* ── Photo grid — captions on hover only ──────────────────────── */}
      <section className="bg-obsidian py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 font-display text-2xl font-semibold text-linen text-center">
            The world is waiting
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ALL_IMAGES.slice(0, 8).map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={img.url.replace('w=1920', 'w=600').replace('w=1200', 'w=600')}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {img.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Second CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-4">
        <img
          src={ALL_IMAGES[3].url}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.45]"
        />
        <div className="relative flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Start your bucket list today
          </h2>
          <p className="mt-3 max-w-md text-white/70">
            Free to use. Sign in with Google and start dreaming.
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-charcoal shadow-lg transition-[transform,opacity] duration-300 ease-premium hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleIcon />
            {signingIn ? 'Redirecting…' : "Get started — it's free"}
          </button>
          <p className="mt-4 text-xs text-white/35">
            Secure sign-in via Google OAuth. Your data stays private.
          </p>
        </div>
      </section>

      <footer className="border-t border-pine/10 bg-alabaster py-6 px-4 text-center text-xs text-pine-muted">
        TravelSnap · Your travel bucket list
      </footer>
    </div>
  )
}
