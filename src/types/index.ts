export interface Profile {
  id: string
  email: string
  avatar_url: string | null
  created_at: string
}

export interface Destination {
  id: string
  user_id: string
  name: string
  is_visited: boolean
  created_at: string
}

export interface PlaceOfInterest {
  id: string
  destination_id: string
  user_id: string
  title: string
  note: string | null
  is_completed: boolean
}

export interface DestinationPhoto {
  id: string
  destination_id: string
  user_id: string
  storage_url: string
  created_at: string
}

export interface DestinationWithPhotos extends Destination {
  destination_photos: DestinationPhoto[]
}

export interface POISuggestion {
  title: string
}

export interface WanderlustRecommendation {
  city: string
  rationale: string
  pois: string[]
}

export interface AISuggestionsResponse {
  suggestions: POISuggestion[]
}

export interface WanderlustResponse {
  recommendation: WanderlustRecommendation
}
