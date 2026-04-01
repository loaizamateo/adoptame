import type { Metadata } from 'next'
import PetsExplorer from '@/components/pets/PetsExplorer'

export const metadata: Metadata = {
  title: 'Adoptar — Encuentra tu compañero ideal',
  description: 'Busca perros, gatos y más mascotas en adopción en toda Latinoamérica. Filtra por ciudad, tamaño, edad y más.',
}

export default function AdoptarPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mascotas en adopción</h1>
        <p className="text-gray-500 mt-1">Encuentra a tu próximo compañero de vida 🐾</p>
      </div>
      <PetsExplorer />
    </main>
  )
}
