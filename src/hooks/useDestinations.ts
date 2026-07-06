import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Destination, DestinationWithPhotos, PlaceOfInterest } from '../types'

export function useDestinations(userId: string | undefined) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDestinations = useCallback(async () => {
    if (!userId) {
      setDestinations([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setDestinations(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  const addDestination = async (name: string) => {
    if (!userId) return null

    const { data, error: insertError } = await supabase
      .from('destinations')
      .insert({ name, user_id: userId })
      .select()
      .single()

    if (insertError) throw insertError
    setDestinations((prev) => [data, ...prev])
    return data as Destination
  }

  const updateDestination = async (id: string, updates: Partial<Destination>) => {
    const { data, error: updateError } = await supabase
      .from('destinations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    setDestinations((prev) => prev.map((d) => (d.id === id ? (data as Destination) : d)))
    return data as Destination
  }

  const deleteDestination = async (id: string) => {
    const { error: deleteError } = await supabase.from('destinations').delete().eq('id', id)
    if (deleteError) throw deleteError
    setDestinations((prev) => prev.filter((d) => d.id !== id))
  }

  return {
    destinations,
    visitedDestinations: destinations.filter((d) => d.is_visited),
    loading,
    error,
    refresh: fetchDestinations,
    addDestination,
    updateDestination,
    deleteDestination,
  }
}

export function useVisitedDestinationsWithPhotos(userId: string | undefined) {
  const [destinations, setDestinations] = useState<DestinationWithPhotos[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVisited = useCallback(async () => {
    if (!userId) {
      setDestinations([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('destinations')
      .select('*, destination_photos(id, storage_url)')
      .eq('is_visited', true)
      .order('created_at', { ascending: false })
      .limit(1, { foreignTable: 'destination_photos' })

    setDestinations((data as DestinationWithPhotos[]) ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchVisited()
  }, [fetchVisited])

  return { destinations, loading, refresh: fetchVisited }
}

export function usePOIs(destinationId: string, userId: string | undefined) {
  const [pois, setPois] = useState<PlaceOfInterest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPOIs = useCallback(async () => {
    if (!destinationId || !userId) {
      setPois([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('places_of_interest')
      .select('*')
      .eq('destination_id', destinationId)
      .order('title', { ascending: true })

    setPois(data ?? [])
    setLoading(false)
  }, [destinationId, userId])

  useEffect(() => {
    fetchPOIs()
  }, [fetchPOIs])

  const addPOI = async (title: string) => {
    if (!userId) return

    const { data, error } = await supabase
      .from('places_of_interest')
      .insert({ destination_id: destinationId, user_id: userId, title })
      .select()
      .single()

    if (error) throw error
    setPois((prev) => [...prev, data as PlaceOfInterest])
  }

  const togglePOI = async (poi: PlaceOfInterest) => {
    const { data, error } = await supabase
      .from('places_of_interest')
      .update({ is_completed: !poi.is_completed })
      .eq('id', poi.id)
      .select()
      .single()

    if (error) throw error
    setPois((prev) => prev.map((p) => (p.id === poi.id ? (data as PlaceOfInterest) : p)))
  }

  const deletePOI = async (id: string) => {
    const { error } = await supabase.from('places_of_interest').delete().eq('id', id)
    if (error) throw error
    setPois((prev) => prev.filter((p) => p.id !== id))
  }

  return { pois, loading, addPOI, togglePOI, deletePOI, refresh: fetchPOIs }
}
