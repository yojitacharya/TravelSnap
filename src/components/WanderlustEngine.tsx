import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchWanderlustRecommendation } from '../lib/openaiApi'
import { supabase } from '../lib/supabaseClient'
import type { WanderlustRecommendation } from '../types'

interface TravelFootprint {
  destinations: Array<{
    name: string
    is_visited: boolean
    places: string[]
  }>
}

export function WanderlustEngine() {
  const { user } = useAuth()
  const [recommendation, setRecommendation] = useState<WanderlustRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const buildFootprint = useCallback(async (): Promise<TravelFootprint | null> => {
    if (!user) return null

    const { data: destinations } = await supabase
      .from('destinations')
      .select('id, name, is_visited')
      .eq('is_visited', true)

    if (!destinations?.length) return null

    const { data: pois } = await supabase
      .from('places_of_interest')
      .select('destination_id, title')
      .in(
        'destination_id',
        destinations.map((d) => d.id),
      )

    const poisByDestination = (pois ?? []).reduce<Record<string, string[]>>((acc, poi) => {
      if (!acc[poi.destination_id]) acc[poi.destination_id] = []
      acc[poi.destination_id].push(poi.title)
      return acc
    }, {})

    return {
      destinations: destinations.map((d) => ({
        name: d.name,
        is_visited: d.is_visited,
        places: poisByDestination[d.id] ?? [],
      })),
    }
  }, [user])

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const footprint = await buildFootprint()
      if (!footprint) {
        setError('Mark at least one destination as visited to unlock recommendations.')
        setRecommendation(null)
        return
      }

      const response = await fetchWanderlustRecommendation(footprint)
      setRecommendation(response.recommendation)
      setHasLoaded(true)
    } catch {
      setError('The Wanderlust Engine is resting. Try again shortly.')
    } finally {
      setLoading(false)
    }
  }, [buildFootprint])

  useEffect(() => {
    if (user && !hasLoaded) {
      generate()
    }
  }, [user, hasLoaded, generate])

  return (
    <section className="animate-fade-up" style={{ animationDelay: '240ms' }}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title">Wanderlust Engine</h2>
          <p className="mt-1 text-sm text-pine-muted dark:text-linen/60">
            AI-powered next destination based on your unique travel footprint.
          </p>
        </div>
        <button type="button" onClick={generate} disabled={loading} className="btn-ghost text-xs">
          {loading ? 'Thinking…' : 'Refresh'}
        </button>
      </div>

      <div className="glass-panel-strong overflow-hidden p-0">
        {loading && !recommendation ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine/20 border-t-pine" />
            <p className="text-sm text-pine-muted dark:text-linen/50">Analyzing your journeys…</p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-pine-muted dark:text-linen/50">{error}</p>
          </div>
        ) : recommendation ? (
          <div className="grid md:grid-cols-[1fr,1.2fr]">
            <div className="relative min-h-[200px] bg-gradient-to-br from-pine via-pine-muted to-evergreen p-8 sm:p-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-alabaster/60">
                Your next adventure
              </span>
              <h3 className="mt-3 font-display text-3xl font-semibold text-alabaster sm:text-4xl">
                {recommendation.city}
              </h3>
              <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-white/5 blur-2xl" />
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-sm leading-relaxed text-charcoal dark:text-linen/90">
                {recommendation.rationale}
              </p>

              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-pine-muted dark:text-linen/50">
                  Recommended spots
                </p>
                <ul className="space-y-2">
                  {recommendation.pois.map((poi) => (
                    <li
                      key={poi}
                      className="flex items-center gap-2 rounded-lg border border-pine/10 bg-pine/5 px-3 py-2 text-sm text-charcoal dark:border-white/10 dark:bg-white/5 dark:text-linen"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pine-muted" />
                      {poi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
