import { useState } from 'react'
import type { Destination } from '../types'
import { usePOIs } from '../hooks/useDestinations'
import { AISuggestionsTray } from './AISuggestionsTray'

interface DestinationCardProps {
  destination: Destination
  userId: string
  /** Number of photos uploaded for this destination (used to block deletion). */
  photoCount: number
  onToggleVisited: (destination: Destination) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function DestinationCard({
  destination,
  userId,
  photoCount,
  onToggleVisited,
  onDelete,
  onRename,
}: DestinationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [newPOI, setNewPOI] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(destination.name)

  // Destination delete confirmation
  const [confirmDeleteDest, setConfirmDeleteDest] = useState(false)

  // POI delete confirmation — stores the poi id pending deletion
  const [confirmDeletePoi, setConfirmDeletePoi] = useState<string | null>(null)

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

  // Whether this destination can be deleted
  const blockedByPhotos = destination.is_visited && photoCount > 0

  const completedCount = pois.filter((p) => p.is_completed).length

  return (
    <article
      className={`glass-panel animate-fade-up overflow-hidden transition-[transform,box-shadow] duration-300 ease-premium hover:shadow-[0_12px_40px_rgba(26,51,30,0.12)] ${
        destination.is_visited ? '!border-pine/25 !bg-pine/[0.04] dark:!bg-pine/10' : ''
      }`}
    >
      {/* Card header */}
      <div className="p-4 sm:p-5">
        {/* Visited badge */}
        {destination.is_visited && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pine/15 px-2.5 py-1 text-xs font-semibold text-pine dark:bg-pine/25 dark:text-linen/90">
            <span className="h-1.5 w-1.5 rounded-full bg-pine dark:bg-linen/90" />
            Visited
          </div>
        )}

        {/* Name */}
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
            className="font-display text-left text-lg font-semibold tracking-tight text-charcoal transition-opacity hover:opacity-70 dark:text-linen"
          >
            {destination.name}
          </button>
        )}

        {/* Progress bar */}
        {pois.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-pine-muted dark:text-linen/50">
              <span>{completedCount} of {pois.length} spots checked off</span>
              <span>{Math.round((completedCount / pois.length) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-pine/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-pine transition-all duration-500 ease-premium dark:bg-pine-muted"
                style={{ width: `${(completedCount / pois.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleVisited(destination)}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-[background-color,border-color,color] duration-300 ease-premium ${
              destination.is_visited
                ? 'border-pine/40 bg-pine/15 text-pine hover:bg-pine/25 dark:border-pine-muted/50 dark:text-linen/90'
                : 'border-pine/20 bg-transparent text-pine-muted hover:border-pine/35 hover:bg-pine/5 dark:border-linen/20 dark:text-linen/60'
            }`}
          >
            {destination.is_visited ? 'Mark as not visited' : 'Mark as visited'}
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn-ghost px-3 py-2 text-xs"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : `Spots${pois.length > 0 ? ` (${pois.length})` : ''}`}
          </button>

          {/* Delete — blocked if visited with photos */}
          {blockedByPhotos ? (
            <span
              title={`Cannot remove — delete the ${photoCount} photo${photoCount !== 1 ? 's' : ''} in its gallery first.`}
              className="cursor-not-allowed rounded-xl border border-transparent px-2 py-2 text-xs text-pine-muted/30 dark:text-linen/20"
            >
              Remove
            </span>
          ) : confirmDeleteDest ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { onDelete(destination.id); setConfirmDeleteDest(false) }}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Yes, remove
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteDest(false)}
                className="rounded-lg border border-pine/20 px-2 py-1.5 text-xs text-pine-muted hover:bg-pine/5 dark:border-linen/20 dark:text-linen/50"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteDest(true)}
              className="rounded-xl border border-transparent px-2 py-2 text-xs text-pine-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              aria-label="Delete destination"
            >
              Remove
            </button>
          )}
        </div>

        {/* Blocked-by-photos hint (shown inline below actions) */}
        {blockedByPhotos && (
          <p className="mt-2 text-[11px] leading-snug text-pine-muted/70 dark:text-linen/40">
            Delete the {photoCount} photo{photoCount !== 1 ? 's' : ''} in its gallery before removing this destination.
          </p>
        )}
      </div>

      {/* Expandable POIs */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-premium ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-pine/10 px-4 pb-4 pt-3 dark:border-white/5 sm:px-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-pine-muted dark:text-linen/50">
              Places to visit
            </p>

            {pois.length === 0 && (
              <p className="mb-3 text-xs text-pine-muted dark:text-linen/40">
                No spots yet — add some below or use AI suggestions.
              </p>
            )}

            <ul className="space-y-2">
              {pois.map((poi) => {
                const pendingPoiDelete = confirmDeletePoi === poi.id
                return (
                  <li key={poi.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePOI(poi)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        poi.is_completed
                          ? 'border-pine bg-pine text-alabaster'
                          : 'border-pine/50 bg-white hover:border-pine dark:border-linen/40 dark:bg-transparent dark:hover:border-linen/70'
                      }`}
                      aria-label={poi.is_completed ? `Uncheck ${poi.title}` : `Check off ${poi.title}`}
                    >
                      {poi.is_completed && (
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>

                    <span
                      className={`flex-1 text-sm ${
                        poi.is_completed
                          ? 'text-pine-muted line-through dark:text-linen/40'
                          : 'text-charcoal dark:text-linen'
                      }`}
                    >
                      {poi.title}
                    </span>

                    {/* POI delete — inline confirm */}
                    {pendingPoiDelete ? (
                      <span className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { deletePOI(poi.id); setConfirmDeletePoi(null) }}
                          className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePoi(null)}
                          className="rounded border border-pine/20 px-2 py-0.5 text-[11px] text-pine-muted hover:bg-pine/5 dark:border-linen/20 dark:text-linen/50"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePoi(poi.id)}
                        className="shrink-0 text-xs text-pine-muted/50 transition-colors hover:text-red-500"
                        aria-label={`Remove ${poi.title}`}
                      >
                        ×
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Add a place to visit…"
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
