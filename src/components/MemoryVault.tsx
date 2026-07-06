import { Link } from 'react-router-dom'
import type { DestinationWithPhotos } from '../types'
import { useRandomCover } from '../hooks/useRandomCover'
import { toThumbnailUrl } from '../lib/supabaseClient'

interface MemoryVaultData {
  destinations: DestinationWithPhotos[]
  loading: boolean
  refresh: () => void
}

function MemoryVaultCard({
  id,
  name,
  photoUrls,
}: {
  id: string
  name: string
  photoUrls: string[]
}) {
  const coverUrl = useRandomCover(id, photoUrls)

  return (
    <Link
      to={`/gallery/${id}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl transition-transform duration-500 ease-premium hover:scale-[1.02] active:scale-[0.99]"
    >
      {coverUrl ? (
        <img
          src={toThumbnailUrl(coverUrl, 800, 75)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pine-muted/40 to-pine/60" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-linen">{name}</h3>
        <p className="mt-1 text-xs text-linen/70">
          {photoUrls.length} {photoUrls.length === 1 ? 'photo' : 'photos'}
        </p>
        <span className="mt-3 inline-block text-xs font-medium text-linen/90 opacity-0 transition-opacity duration-300 ease-premium group-hover:opacity-100">
          Open gallery
        </span>
      </div>
    </Link>
  )
}

export function MemoryVault({ data }: { data: MemoryVaultData }) {
  const { destinations, loading } = data

  return (
    <section className="animate-fade-up" style={{ animationDelay: '120ms' }}>
      <div className="mb-6">
        <h2 className="section-title">Memory Vault</h2>
        <p className="mt-1 text-sm text-pine-muted dark:text-linen/60">
          Places you've been — locked with your photo memories.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine/20 border-t-pine" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="glass-panel px-6 py-10 text-center">
          <p className="text-sm text-pine-muted dark:text-linen/50">
            Mark destinations as visited to see them here with your photo memories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <MemoryVaultCard
              key={destination.id}
              id={destination.id}
              name={destination.name}
              photoUrls={destination.destination_photos.map((p) => p.storage_url)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
