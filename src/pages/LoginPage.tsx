import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { HeroBackdrop } from '../components/HeroBackdrop'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine/20 border-t-pine" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <HeroBackdrop />

      <div className="animate-scale-in w-full max-w-md">
        <div className="glass-panel-strong p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pine text-alabaster">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-pine">TravelSnap</h1>
            <p className="mt-2 text-sm text-pine-muted">
              Your immersive travel itinerary and memory vault.
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="btn-primary w-full py-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {signingIn ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <p className="mt-6 text-center text-xs text-pine-muted/80">
            Secure sign-in via Google OAuth. Your data stays private with row-level security.
          </p>
        </div>
      </div>
    </div>
  )
}
