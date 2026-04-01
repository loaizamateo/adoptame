import Link from 'next/link'
import type { Pet } from '@adoptame/types'
import { PET_LABELS } from '@/lib/utils'

interface Props {
  pet: Pet
}

export function PetCard({ pet }: Props) {
  return (
    <Link href={`/mascotas/${pet._id}`}>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-200 transition-all group cursor-pointer">
        {/* Foto */}
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {pet.photos?.[0] ? (
            <img
              src={pet.photos[0]}
              alt={pet.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
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
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition">
            {pet.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {pet.breed || PET_LABELS.species[pet.species]} · {PET_LABELS.age[pet.age]} · {PET_LABELS.size[pet.size]}
          </p>
          <p className="text-xs text-gray-400 mt-1">📍 {pet.city}</p>

          {/* Badges */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {pet.vaccinated && (
              <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">💉 Vacunado</span>
            )}
            {pet.sterilized && (
              <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">✂️ Esterilizado</span>
            )}
            {pet.compatibleWithKids && (
              <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full">👶 Niños</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
