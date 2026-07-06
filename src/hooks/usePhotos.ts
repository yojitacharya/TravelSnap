import { useCallback, useEffect, useState } from 'react'
import { PHOTOS_BUCKET, supabase } from '../lib/supabaseClient'
import type { DestinationPhoto } from '../types'

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return publicUrl.slice(index + marker.length)
}

export function useDestinationPhotos(destinationId: string | undefined, userId: string | undefined) {
  const [photos, setPhotos] = useState<DestinationPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    if (!destinationId || !userId) {
      setPhotos([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('destination_photos')
      .select('*')
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false })

    setPhotos(data ?? [])
    setLoading(false)
  }, [destinationId, userId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const uploadPhotos = async (files: File[]) => {
    if (!destinationId || !userId) return

    const uploadOne = async (file: File): Promise<DestinationPhoto> => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${destinationId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path)

      const { data, error: insertError } = await supabase
        .from('destination_photos')
        .insert({
          destination_id: destinationId,
          user_id: userId,
          storage_url: urlData.publicUrl,
        })
        .select()
        .single()
      if (insertError) throw insertError

      return data as DestinationPhoto
    }

    const uploaded = await Promise.all(files.map(uploadOne))
    setPhotos((prev) => [...uploaded.reverse(), ...prev])
  }

  const deletePhoto = async (photoId: string, storageUrl: string) => {
    const path = extractStoragePath(storageUrl)
    if (path) {
      await supabase.storage.from(PHOTOS_BUCKET).remove([path])
    }

    const { error } = await supabase.from('destination_photos').delete().eq('id', photoId)
    if (error) throw error

    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  return { photos, loading, uploadPhotos, deletePhoto, refresh: fetchPhotos }
}
