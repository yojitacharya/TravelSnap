import { supabase } from './supabaseClient'
import type { AISuggestionsResponse, WanderlustResponse } from '../types'

export async function fetchPOISuggestions(
  destinationName: string,
): Promise<AISuggestionsResponse> {
  const { data, error } = await supabase.functions.invoke('poi-suggestions', {
    body: { destinationName },
  })

  if (error) throw error
  return data as AISuggestionsResponse
}

export async function fetchWanderlustRecommendation(
  travelFootprint: unknown,
): Promise<WanderlustResponse> {
  const { data, error } = await supabase.functions.invoke('wanderlust-engine', {
    body: { travelFootprint },
  })

  if (error) throw error
  return data as WanderlustResponse
}
