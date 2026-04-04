import { track } from '@vercel/analytics'

/**
 * Trackea cuando un usuario envía una solicitud de adopción
 */
export function trackAdoptionRequest(petId: string, petName: string, species: string) {
  track('adoption_request_sent', { petId, petName, species })
}

/**
 * Trackea cuando se visualiza el perfil de una mascota
 */
export function trackPetViewed(petId: string, petName: string, species: string, city: string) {
  track('pet_viewed', { petId, petName, species, city })
}

/**
 * Trackea cuando se visualiza el perfil de una fundación
 */
export function trackFoundationViewed(slug: string, foundationName: string, city: string) {
  track('foundation_viewed', { slug, foundationName, city })
}

/**
 * Trackea búsquedas en el buscador unificado
 */
export function trackSearch(query: string, petsFound: number, foundationsFound: number) {
  track('search_performed', { query, petsFound, foundationsFound })
}

/**
 * Trackea cuando alguien se registra como hogar de paso
 */
export function trackFosterHomeRegistered(city: string, country: string) {
  track('foster_home_registered', { city, country })
}
