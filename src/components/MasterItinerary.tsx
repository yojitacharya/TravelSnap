import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDestinations } from '../hooks/useDestinations'
import { supabase } from '../lib/supabaseClient'
import { DestinationCard } from './DestinationCard'
import { AISuggestionsTray } from './AISuggestionsTray'

export function MasterItinerary() {
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

  return (
    <section className="animate-fade-up">
      <div className="mb-6">
        <h2 className="section-title">Master Itinerary</h2>
        <p className="mt-1 text-sm text-pine-muted dark:text-linen/60">
          Plan your next adventures with nested places of interest.
        </p>
      </div>

      <div className="glass-panel-strong mb-6 p-4 sm:p-5">
        <label htmlFor="new-destination" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-pine-muted dark:text-linen/50">
          Add destination
        </label>
        <div className="flex gap-2">
          <input
            id="new-destination"
            className="input-field flex-1"
            placeholder="Kyoto, Japan — or Paris, France"
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
        <div className="glass-panel px-6 py-12 text-center">
          <p className="font-display text-lg text-pine dark:text-linen">No destinations yet</p>
          <p className="mt-1 text-sm text-pine-muted dark:text-linen/50">
            Add your first city, state, or country above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map((destination, index) => (
            <div key={destination.id} style={{ animationDelay: `${index * 60}ms` }}>
              <DestinationCard
                destination={destination}
                userId={user!.id}
                onToggleVisited={(d) => updateDestination(d.id, { is_visited: !d.is_visited })}
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
