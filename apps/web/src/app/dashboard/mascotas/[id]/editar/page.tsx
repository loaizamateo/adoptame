'use client'

import { useEffect, useState } from 'react'
import { getPetById } from '@/lib/pets'
import PetForm from '@/components/pets/PetForm'
import type { Pet } from '@adoptame/types'

interface Props { params: { id: string } }

export default function EditPetPage({ params }: Props) {
  const [pet, setPet] = useState<Pet | null>(null)

  useEffect(() => {
    getPetById(params.id).then(setPet)
  }, [params.id])

  if (!pet) return <div className="container mx-auto px-4 py-8 animate-pulse"><div className="h-20 bg-gray-100 rounded-2xl" /></div>

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar — {pet.name}</h1>
      <PetForm pet={pet} />
    </main>
  )
}
