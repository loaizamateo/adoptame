'use client'

import { useEffect, useState } from 'react'
import { getPetById } from '@/lib/pets'
import type { Pet } from '@adoptame/types'
import { PET_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth'

interface Props { id: string }

export default function PetDetail({ id }: Props) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    getPetById(id)
      .then(setPet)
      .catch(() => setPet(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-8 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">😢</span>
        <h1 className="text-xl font-bold">Mascota no encontrada</h1>
        <Link href="/adoptar" className="text-brand-600 mt-2 inline-block hover:underline">
          Ver otras mascotas
        </Link>
      </div>
    )
  }

  const foundation = pet.foundation as any

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
            {pet.photos?.[activePhoto] ? (
              <img src={pet.photos[activePhoto]} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'}
              </div>
            )}
          </div>
          {pet.photos?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {pet.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === activePhoto ? 'border-brand-500' : 'border-transparent'}`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-500 mt-1">
                {pet.breed || PET_LABELS.species[pet.species]} · {PET_LABELS.age[pet.age]} · {PET_LABELS.size[pet.size]} · {pet.sex === 'male' ? 'Macho ♂' : 'Hembra ♀'}
              </p>
              <p className="text-sm text-gray-400 mt-1">📍 {pet.city}, {pet.country}</p>
            </div>
            {pet.urgent && (
              <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">🚨 Urgente</span>
            )}
          </div>

          {/* Badges de salud */}
          <div className="flex flex-wrap gap-2 mt-4">
            {pet.vaccinated && <Badge color="green">💉 Vacunado</Badge>}
            {pet.sterilized && <Badge color="blue">✂️ Esterilizado</Badge>}
            {pet.dewormed && <Badge color="purple">💊 Desparasitado</Badge>}
            {pet.compatibleWithKids && <Badge color="yellow">👶 Compatible con niños</Badge>}
            {pet.compatibleWithPets && <Badge color="orange">🐾 Compatible con mascotas</Badge>}
          </div>

          {/* Descripción */}
          <div className="mt-5">
            <h2 className="font-semibold text-gray-900 mb-2">Sobre {pet.name}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{pet.description}</p>
          </div>

          {pet.story && (
            <div className="mt-4">
              <h2 className="font-semibold text-gray-900 mb-2">Su historia</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{pet.story}</p>
            </div>
          )}

          {/* Fundación */}
          {foundation && (
            <Link href={`/fundaciones/${foundation.slug || foundation._id}`}>
              <div className="mt-5 p-3 bg-gray-50 rounded-xl flex items-center gap-3 hover:bg-brand-50 transition">
                <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-xl overflow-hidden">
                  {foundation.logo ? <img src={foundation.logo} alt="" className="w-full h-full object-cover" /> : '🐾'}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Publicado por</p>
                  <p className="text-sm font-semibold text-gray-800">{foundation.name}</p>
                </div>
              </div>
            </Link>
          )}

          {/* CTA */}
          <div className="mt-6">
            {pet.status === 'available' ? (
              isAuthenticated() ? (
                <Link href={`/mascotas/${pet._id}/adoptar`}>
                  <Button size="lg" className="w-full rounded-full">
                    ❤️ Quiero adoptar a {pet.name}
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="w-full rounded-full">
                    Regístrate para adoptar
                  </Button>
                </Link>
              )
            ) : (
              <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-full text-sm font-medium">
                {pet.status === 'in_process' ? '⏳ En proceso de adopción' : '✅ Ya fue adoptado'}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[color]}`}>{children}</span>
  )
}
