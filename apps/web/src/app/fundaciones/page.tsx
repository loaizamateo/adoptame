import type { Metadata } from 'next'
import FoundationsList from '@/components/foundations/FoundationsList'

export const metadata: Metadata = {
  title: 'Fundaciones — Adopta con una organización verificada',
  description: 'Conoce las fundaciones y refugios de animales que trabajan para dar hogares a mascotas en Latinoamérica.',
}

export default function FoundationsPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fundaciones & Refugios</h1>
        <p className="text-gray-500 mt-2">
          Organizaciones que trabajan para dar hogares a mascotas en Latinoamérica.
        </p>
      </div>
      <FoundationsList />
    </main>
  )
}
