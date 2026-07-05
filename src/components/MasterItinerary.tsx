import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDestinations } from '../hooks/useDestinations'
import { supabase } from '../lib/supabaseClient'
import { DestinationCard } from './DestinationCard'
import { AISuggestionsTray } from './AISuggestionsTray'

interface MasterItineraryProps {
  onVisitedChange?: () => void
  /** Map of destination id → photo count, used to block deletion of visited destinations. */
  photoCounts?: Record<string, number>
}

export function MasterItinerary({ onVisitedChange, photoCounts = {} }: MasterItineraryProps) {
  const { user } = useAuth()
  const { destinations, loading, addDestination, updateDestination, deleteDestination } =
    useDestinations(user?.id)
  const [newDestination, setNewDestination] = useState('')
  const [adding, setAdding] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAdd = async (name?: string) => {
    const value = (name ?? newDestination).trim()
    if (!value) return

    setAdding(true)
    try {
      await addDestination(value)
      setNewDestination('')
      setShowSuggestions(false)
    } finally {
      setAdding(false)
    }
  }

  const upcomingCount = destinations.filter((d) => !d.is_visited).length
  const visitedCount = destinations.filter((d) => d.is_visited).length

  return (
    <section className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title">My Bucket List</h2>
          <p className="mt-1 text-sm text-pine-muted dark:text-linen/60">
            Every dream destination, every must-see spot — all in one place.
          </p>
        </div>
        {destinations.length > 0 && (
          <div className="flex gap-3 text-sm">
            <span className="rounded-full border border-pine/15 bg-pine/5 px-3 py-1 text-xs font-medium text-pine dark:border-linen/15 dark:bg-white/5 dark:text-linen">
              {upcomingCount} to go
            </span>
            <span className="rounded-full border border-pine/30 bg-pine/10 px-3 py-1 text-xs font-medium text-pine dark:border-pine-muted/40 dark:bg-pine/20 dark:text-linen/80">
              {visitedCount} visited
            </span>
          </div>
        )}
      </div>

      <div className="glass-panel-strong mb-6 p-4 sm:p-5">
        <label htmlFor="new-destination" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-pine-muted dark:text-linen/50">
          Add a destination to your bucket list
        </label>
        <div className="flex gap-2">
          <input
            id="new-destination"
            className="input-field flex-1"
            placeholder="Tokyo, Japan — or Patagonia, Argentina"
            value={newDestination}
            onChange={(e) => {
              setNewDestination(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button type="button" onClick={() => handleAdd()} disabled={adding} className="btn-primary shrink-0">
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        <AISuggestionsTray
          destinationName={newDestination}
          visible={showSuggestions}
          onSelect={async (title) => {
            const destName = newDestination.trim()
            if (!destName) return
            setAdding(true)
            try {
              const destination = await addDestination(destName)
              if (destination) {
                await supabase.from('places_of_interest').insert({
                  destination_id: destination.id,
                  user_id: user!.id,
                  title,
                })
              }
              setNewDestination('')
              setShowSuggestions(false)
            } finally {
              setAdding(false)
            }
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine/20 border-t-pine" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="glass-panel px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-pine dark:text-linen">
            Where do you want to go?
          </p>
          <p className="mt-2 text-sm text-pine-muted dark:text-linen/50">
            Start building your bucket list — add your first dream destination above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <div key={destination.id} style={{ animationDelay: `${index * 60}ms` }}>
              <DestinationCard
                destination={destination}
                userId={user!.id}
                photoCount={photoCounts[destination.id] ?? 0}
                onToggleVisited={async (d) => {
                  await updateDestination(d.id, { is_visited: !d.is_visited })
                  onVisitedChange?.()
                }}
                onDelete={deleteDestination}
                onRename={(id, name) => updateDestination(id, { name })}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
