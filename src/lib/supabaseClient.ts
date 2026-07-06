import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase credentials.',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
)

export const PHOTOS_BUCKET = 'destination-photos'

/**
 * Appends Supabase Storage image-transform query params to a public URL.
 * Supabase resizes on the fly via its built-in image optimizer.
 * https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function toThumbnailUrl(publicUrl: string, width = 600, quality = 75): string {
  try {
    const url = new URL(publicUrl)
    url.searchParams.set('width', String(width))
    url.searchParams.set('quality', String(quality))
    return url.toString()
  } catch {
    return publicUrl
  }
}
