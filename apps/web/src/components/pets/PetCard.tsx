'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Pet } from '@adoptame/types'
import { PET_LABELS } from '@/lib/utils'
import { useFavoritesStore } from '@/store/favorites'
import { Heart } from 'lucide-react'

interface Props { pet: Pet }

export function PetCard({ pet }: Props) {
  const { isFavorite, toggle } = useFavoritesStore()
  const fav = isFavorite(pet._id)

  return (
    <Link href={`/mascotas/${pet._id}`} prefetch={false}>
      <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary-200 transition-all group cursor-pointer">
        {/* Foto */}
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {pet.photos?.[0] ? (
            <Image
              src={pet.photos[0]}
              alt={`${pet.name} — ${PET_LABELS.species[pet.species]} en adopción en ${pet.city}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl" aria-hidden="true">
              {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'}
            </div>
          )}
          {pet.urgent && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              🚨 Urgente
            </span>
          )}
          <span className="absolute top-2 right-2 bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {pet.sex === 'male' ? '♂' : '♀'}
          </span>

          {/* Favorite button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(pet._id) }}
            aria-label={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className={[
              'absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm',
              fav
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white',
            ].join(' ')}
          >
            <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
            {pet.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {pet.breed || PET_LABELS.species[pet.species]} · {PET_LABELS.age[pet.age]} · {PET_LABELS.size[pet.size]}
          </p>
          <p className="text-xs text-gray-400 mt-1">📍 {pet.city}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {pet.vaccinated && <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">💉 Vacunado</span>}
            {pet.sterilized && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">✂️ Esterilizado</span>}
            {pet.compatibleWithKids && <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full">👶 Niños</span>}
          </div>
        </div>
      </article>
    </Link>
  )
}
