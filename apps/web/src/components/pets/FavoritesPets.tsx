'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFavoritesStore } from '@/store/favorites'
import { getPetById } from '@/lib/pets'
import { PetCard } from './PetCard'
import { PetCardSkeleton } from './PetCardSkeleton'
import type { Pet } from '@adoptame/types'
import { Heart } from 'lucide-react'

export function FavoritesPets() {
  const { petIds, clear } = useFavoritesStore()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (petIds.length === 0) {
      setPets([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.allSettled(petIds.map((id) => getPetById(id)))
      .then((results) => {
        const found = results
          .filter((r): r is PromiseFulfilledResult<Pet> => r.status === 'fulfilled')
          .map((r) => r.value)
        setPets(found)
      })
      .finally(() => setLoading(false))
  }, [petIds])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: petIds.length || 4 }).map((_, i) => (
          <PetCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-24">
        <Heart size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-500 font-medium text-lg">Aún no tienes favoritos</p>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Presiona el corazón en cualquier mascota para guardarla aquí
        </p>
        <Link
          href="/adoptar"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-700 transition text-sm"
        >
          Explorar mascotas →
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {pets.length} mascota{pets.length !== 1 ? 's' : ''} guardada{pets.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={clear}
          className="text-xs text-gray-400 hover:text-red-500 transition"
        >
          Limpiar favoritos
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pets.map((pet) => (
          <PetCard key={pet._id} pet={pet} />
        ))}
      </div>
    </>
  )
}
