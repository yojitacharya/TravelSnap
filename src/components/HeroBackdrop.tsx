const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
]

export function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <img src={HERO_IMAGES[0]} alt="" />
    </div>
  )
}
