import type { Metadata } from 'next'
import FoundationAdoptions from '@/components/adoptions/FoundationAdoptions'

export const metadata: Metadata = { title: 'Solicitudes recibidas' }

export default function FoundationAdoptionsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitudes de adopción</h1>
      <FoundationAdoptions />
    </main>
  )
}
