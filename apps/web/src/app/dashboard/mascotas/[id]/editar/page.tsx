'use client'

import { useEffect, useState } from 'react'
import { EditPetForm } from '@/components/pets/EditPetForm'
import { getPetById } from '@/lib/pets'
import type { Pet } from '@adoptame/types'

interface Props { params: Promise<{ id: string }> }

export default async function EditPetPage({ params }: Props) {
  const { id } = await params
  return <EditPetPageClient id={id} />
}

function EditPetPageClient({ id }: { id: string }) {
  const [pet, setPet] = useState<Pet | null>(null)

  useEffect(() => {
    getPetById(id).then(setPet)
  }, [id])

  if (!pet) return null
  return <EditPetForm pet={pet} />
}
