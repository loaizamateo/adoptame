'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getPets } from '@/lib/pets'
import { PetCard } from '@/components/pets/PetCard'
import { PetCardSkeleton } from '@/components/pets/PetCardSkeleton'
import { LocationPill } from './LocationPill'
import { useLocation } from '@/hooks/useLocation'
import type { Pet, PetSpecies } from '@adoptame/types'

const SPECIES: { value: '' | import('@adoptame/types').PetSpecies; label: string; emoji: string }[] = [
  { value: '', label: 'Todos', emoji: '🐾' },
  { value: 'dog', label: 'Perros', emoji: '🐶' },
  { value: 'cat', label: 'Gatos', emoji: '🐱' },
  { value: 'other', label: 'Otros', emoji: '🐰' },
]

export function MarketplaceFeed() {
  const { location, setManualLocation } = useLocation()
  const [pets, setPets] = useState<Pet[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [species, setSpecies] = useState<PetSpecies | ''>('')
  const [fallback, setFallback] = useState(false)

  const fetchPets = useCallback(async (city: string, country: string, sp: PetSpecies | '') => {
    setLoading(true)
    setFallback(false)
    try {
      // Primero intenta por ciudad
      if (city) {
        const res = await getPets({ city, species: sp || undefined, limit: 8, page: 1 })
        if (res.data.length > 0) {
          setPets(res.data)
          setTotal(res.total)
          setLoading(false)
          return
        }
        // Fallback: buscar en el país
        setFallback(true)
        const res2 = await getPets({ country, species: sp || undefined, limit: 8, page: 1 })
        setPets(res2.data)
        setTotal(res2.total)
      } else {
        const res = await getPets({ species: sp || undefined, limit: 8, page: 1 })
        setPets(res.data)
        setTotal(res.total)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!location.loading) {
      fetchPets(location.city, location.country, species)
    }
  }, [location.loading, location.city, location.country, species, fetchPets])

  const handleSpecies = (val: PetSpecies | '') => {
    setSpecies(val)
  }

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Header con ubicación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {location.loading ? 'Mascotas en adopción' :
              location.city ? 'Mascotas cerca de ti' : 'Mascotas en adopción'}
          </h2>
          {fallback && location.city && (
            <p className="text-sm text-gray-500 mt-0.5">
              No hay mascotas en {location.city} aún — mostrando resultados de {location.country}
            </p>
          )}
          {!fallback && location.city && !loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {total} {total === 1 ? 'mascota disponible' : 'mascotas disponibles'} en {location.city}
            </p>
          )}
        </div>
        <LocationPill location={location} onChangeLocation={setManualLocation} />
      </div>

      {/* Filtro especie */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SPECIES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleSpecies(s.value)}
            className={[
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
              species === s.value
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
            ].join(' ')}
          >
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <PetCardSkeleton key={i} />)}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">🐾</span>
          <p className="text-gray-500 text-lg">No hay mascotas disponibles en esta zona aún.</p>
          <button
            onClick={() => setManualLocation('', '')}
            className="mt-4 text-primary-600 font-medium hover:underline text-sm"
          >
            Ver toda Latinoamérica →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pets.map((pet) => <PetCard key={pet._id} pet={pet} />)}
          </div>
          <div className="text-center mt-8">
            <Link
              href={'/adoptar' + (location.city ? '?city=' + encodeURIComponent(location.city) : '')}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition"
            >
              Ver todos ({total}) →
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
