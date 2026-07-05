import { useState } from 'react'

/**
 * Picks a random cover photo once when the card mounts.
 * Stays static while the dashboard is visible; remounting (refresh or navigate back) picks anew.
 */
export function useRandomCover(_destinationId: string, photoUrls: string[]): string | null {
  const [coverUrl] = useState<string | null>(() => {
    if (photoUrls.length === 0) return null
    const randomIndex = Math.floor(Math.random() * photoUrls.length)
    return photoUrls[randomIndex] ?? null
  })

  return coverUrl
}
