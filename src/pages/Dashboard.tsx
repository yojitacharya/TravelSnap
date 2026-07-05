import { AppHeader } from '../components/AppHeader'
import { HeroBackdrop } from '../components/HeroBackdrop'
import { MasterItinerary } from '../components/MasterItinerary'
import { MemoryVault } from '../components/MemoryVault'
import { WanderlustEngine } from '../components/WanderlustEngine'
import { useAuth } from '../context/AuthContext'
import { useVisitedDestinationsWithPhotos } from '../hooks/useDestinations'
import { LANDSCAPE_IMAGES } from '../lib/landscapeImages'

const BANNER_URL = LANDSCAPE_IMAGES[2].url // Rocky peaks

export function Dashboard() {
  const { user } = useAuth()
  const memoryVaultData = useVisitedDestinationsWithPhotos(user?.id)

  // Build a map of destination id → photo count for deletion guards
  const photoCounts: Record<string, number> = {}
  for (const d of memoryVaultData.destinations) {
    photoCounts[d.id] = d.destination_photos.length
  }

  return (
    <div className="relative min-h-screen">
      <HeroBackdrop />
      <AppHeader />

      {/* Dashboard banner */}
      <div className="relative h-48 overflow-hidden sm:h-60">
        <img
          src={BANNER_URL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/20 via-obsidian/35 to-white dark:to-obsidian" />
        <div className="relative flex h-full flex-col justify-end px-4 pb-6 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white drop-shadow sm:text-4xl">
              Your travel bucket list
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              Dream it. Plan it. Live it. Every place you've ever wanted to see — organised, tracked, and remembered.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-16">
          <MasterItinerary onVisitedChange={memoryVaultData.refresh} photoCounts={photoCounts} />
          <MemoryVault data={memoryVaultData} />
          <WanderlustEngine />
        </div>
      </main>
    </div>
  )
}
