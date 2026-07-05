import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDestinationPhotos } from '../hooks/usePhotos'
import { supabase } from '../lib/supabaseClient'
import { compressImages } from '../lib/imageCompression'
import type { Destination } from '../types'

export function GalleryView() {
  const { destinationId } = useParams<{ destinationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { photos, loading, uploadPhotos, deletePhoto } = useDestinationPhotos(
    destinationId,
    user?.id,
  )
  const [destination, setDestination] = useState<Destination | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ID of the photo pending confirmation; null = none
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!destinationId) return

    supabase
      .from('destinations')
      .select('*')
      .eq('id', destinationId)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError || !data) {
          navigate('/', { replace: true })
          return
        }
        setDestination(data as Destination)
      })
  }, [destinationId, navigate])

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (imageFiles.length === 0) return

      setUploading(true)
      setError(null)

      try {
        const compressed = await compressImages(imageFiles)
        await uploadPhotos(compressed)
      } catch {
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [uploadPhotos],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return
    const photo = photos.find((p) => p.id === pendingDeleteId)
    if (photo) await deletePhoto(photo.id, photo.storage_url)
    setPendingDeleteId(null)
  }

  const handleDeleteCancel = () => {
    setPendingDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-obsidian text-linen animate-fade-in">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-obsidian/90 backdrop-blur-gallery">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-linen/80 transition-[transform,background-color] duration-300 ease-premium hover:bg-white/5 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
            <div>
              <h1 className="font-display text-xl font-semibold">{destination?.name ?? 'Gallery'}</h1>
              <p className="text-xs text-linen/50">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary text-xs sm:text-sm"
          >
            {uploading ? 'Uploading…' : 'Add photos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`mb-8 rounded-2xl border-2 border-dashed p-8 text-center transition-[border-color,background-color] duration-300 ease-premium ${
            dragActive
              ? 'border-pine-muted/60 bg-evergreen/50'
              : 'border-white/10 bg-evergreen/30 hover:border-white/20'
          }`}
        >
          <svg className="mx-auto mb-3 h-10 w-10 text-linen/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-linen/70">
            Drop photos here or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-linen underline-offset-2 hover:underline"
            >
              browse files
            </button>
          </p>
          <p className="mt-1 text-xs text-linen/40">Optimized to ~0.8MB at 2K resolution on upload</p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/40 px-4 py-2 text-center text-sm text-red-300">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-linen/20 border-t-linen" />
          </div>
        ) : photos.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-lg text-linen/60">No photos yet</p>
            <p className="mt-1 text-sm text-linen/40">Upload your first memory above.</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo, index) => {
              const isPending = pendingDeleteId === photo.id
              return (
                <div
                  key={photo.id}
                  className="masonry-item group relative overflow-hidden rounded-xl animate-fade-up"
                  style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                >
                  <img
                    src={photo.storage_url}
                    alt=""
                    className={`w-full rounded-xl object-cover transition-[transform,filter] duration-300 ease-premium group-hover:scale-[1.02] ${isPending ? 'brightness-50' : ''}`}
                    loading="lazy"
                  />

                  {/* Default delete trigger */}
                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(photo.id)}
                      className="absolute right-2 top-2 rounded-lg bg-obsidian/70 p-1.5 text-linen/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 hover:text-red-400"
                      aria-label="Delete photo"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Inline confirmation overlay */}
                  {isPending && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl p-4">
                      <p className="text-center text-sm font-semibold text-white drop-shadow">
                        Delete this photo?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteConfirm}
                          className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteCancel}
                          className="rounded-lg bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-opacity hover:opacity-90"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
