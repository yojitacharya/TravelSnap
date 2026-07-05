import { useMemo } from 'react'

/**
 * Picks a random cover photo once per destinationId.
 * useMemo re-runs only when destinationId changes, so it is stable
 * across parent re-renders but picks fresh on a new page load.
 */
export function useRandomCover(destinationId: string, photoUrls: string[]): string | null {
  return useMemo(() => {
    if (photoUrls.length === 0) return null
    if (photoUrls.length === 1) return photoUrls[0]
    const index = Math.floor(Math.random() * photoUrls.length)
    return photoUrls[index] ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationId]) // intentionally excludes photoUrls — pick is frozen per destination
}
