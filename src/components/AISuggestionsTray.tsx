import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPOISuggestions } from '../lib/openaiApi'

interface AISuggestionsTrayProps {
  destinationName: string
  onSelect: (title: string) => void
  visible: boolean
}

export function AISuggestionsTray({ destinationName, onSelect, visible }: AISuggestionsTrayProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFetchedRef = useRef('')

  const loadSuggestions = useCallback(async (name: string) => {
    if (name.trim().length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchPOISuggestions(name.trim())
      setSuggestions(response.suggestions.map((s) => s.title))
      lastFetchedRef.current = name.trim()
    } catch {
      setError('Could not load suggestions')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!visible || destinationName.trim().length < 3) {
      setSuggestions([])
      return
    }

    if (destinationName.trim() === lastFetchedRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadSuggestions(destinationName)
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [destinationName, visible, loadSuggestions])

  if (!visible || destinationName.trim().length < 3) return null

  return (
    <div className="animate-slide-down mt-3 rounded-xl border border-pine/10 bg-white/90 p-3 dark:border-white/10 dark:bg-evergreen/90">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-pine-muted dark:text-linen/60">
          AI Suggestions
        </span>
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border border-pine/20 border-t-pine" />
        )}
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && suggestions.length === 0 && (
        <p className="text-xs text-pine-muted dark:text-linen/50">No suggestions yet — keep typing.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((title) => (
          <button
            key={title}
            type="button"
            onClick={() => onSelect(title)}
            className="rounded-full border border-pine/15 bg-pine/5 px-3 py-1 text-xs font-medium text-pine
              transition-[transform,background-color] duration-300 ease-premium hover:bg-pine/10 active:scale-[0.97]
              dark:border-linen/15 dark:bg-white/5 dark:text-linen dark:hover:bg-white/10"
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  )
}
