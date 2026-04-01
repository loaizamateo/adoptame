import type { Metadata } from 'next'
import PetForm from '@/components/pets/PetForm'

export const metadata: Metadata = { title: 'Publicar mascota' }

export default function NewPetPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Publicar mascota en adopción</h1>
      <PetForm />
    </main>
  )
}
