import { useState } from 'react'
import type { Destination } from '../types'
import { usePOIs } from '../hooks/useDestinations'
import { AISuggestionsTray } from './AISuggestionsTray'

interface DestinationCardProps {
  destination: Destination
  userId: string
  onToggleVisited: (destination: Destination) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function DestinationCard({
  destination,
  userId,
  onToggleVisited,
  onDelete,
  onRename,
}: DestinationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [newPOI, setNewPOI] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(destination.name)
  const { pois, addPOI, togglePOI, deletePOI } = usePOIs(destination.id, userId)

  const handleAddPOI = async (title?: string) => {
    const value = (title ?? newPOI).trim()
    if (!value) return
    await addPOI(value)
    setNewPOI('')
  }

  const saveName = () => {
    const trimmed = nameDraft.trim()
    if (trimmed && trimmed !== destination.name) {
      onRename(destination.id, trimmed)
    }
    setEditingName(false)
  }

  return (
    <article className="glass-panel animate-fade-up overflow-hidden transition-[transform,box-shadow] duration-300 ease-premium hover:shadow-[0_12px_40px_rgba(26,51,30,0.12)]">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => onToggleVisited(destination)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-300 ease-premium ${
            destination.is_visited
              ? 'border-pine bg-pine text-alabaster'
              : 'border-pine/25 bg-transparent hover:border-pine/50'
          }`}
          aria-label={destination.is_visited ? 'Mark as not visited' : 'Mark as visited'}
        >
          {destination.is_visited && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          {editingName ? (
            <input
              autoFocus
              className="input-field font-display text-base font-semibold"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName()
                if (e.key === 'Escape') {
                  setNameDraft(destination.name)
                  setEditingName(false)
                }
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="font-display text-left text-base font-semibold text-charcoal transition-opacity hover:opacity-70 dark:text-linen"
            >
              {destination.name}
            </button>
          )}

          <p className="mt-0.5 text-xs text-pine-muted dark:text-linen/50">
            {destination.is_visited ? 'Visited — in Memory Vault' : 'Upcoming destination'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn-ghost px-2 py-1.5 text-xs"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide POIs' : 'POIs'}
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-300 ease-premium ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(destination.id)}
            className="rounded-lg p-1.5 text-pine-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
            aria-label="Delete destination"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-premium ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-pine/10 px-4 pb-4 pt-3 dark:border-white/5 sm:px-5">
            <ul className="space-y-2">
              {pois.map((poi) => (
                <li key={poi.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePOI(poi)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      poi.is_completed
                        ? 'border-pine-muted bg-pine-muted text-alabaster'
                        : 'border-pine/20 hover:border-pine/40'
                    }`}
                  >
                    {poi.is_completed && (
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      poi.is_completed ? 'text-pine-muted line-through dark:text-linen/40' : 'text-charcoal dark:text-linen'
                    }`}
                  >
                    {poi.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => deletePOI(poi.id)}
                    className="text-pine-muted/60 hover:text-red-500"
                    aria-label={`Remove ${poi.title}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Add a place of interest…"
                value={newPOI}
                onChange={(e) => setNewPOI(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPOI()}
              />
              <button type="button" onClick={() => handleAddPOI()} className="btn-primary shrink-0 px-3">
                Add
              </button>
            </div>

            <AISuggestionsTray
              destinationName={destination.name}
              visible={expanded}
              onSelect={(title) => handleAddPOI(title)}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
