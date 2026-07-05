import { AppHeader } from '../components/AppHeader'
import { HeroBackdrop } from '../components/HeroBackdrop'
import { MasterItinerary } from '../components/MasterItinerary'
import { MemoryVault } from '../components/MemoryVault'
import { WanderlustEngine } from '../components/WanderlustEngine'

export function Dashboard() {
  return (
    <div className="relative min-h-screen">
      <HeroBackdrop />
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-10 animate-fade-up">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-pine dark:text-linen sm:text-4xl">
            Your journey awaits
          </h2>
          <p className="mt-2 max-w-xl text-sm text-pine-muted dark:text-linen/60">
            Plan upcoming adventures, revisit memories, and discover your next destination.
          </p>
        </div>

        <div className="space-y-16">
          <MasterItinerary />
          <MemoryVault />
          <WanderlustEngine />
        </div>
      </main>
    </div>
  )
}
