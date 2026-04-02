import type { Metadata } from 'next'
import MyAdoptions from '@/components/adoptions/MyAdoptions'

export const metadata: Metadata = { title: 'Mis solicitudes de adopción' }

export default function MyAdoptionsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis solicitudes de adopción</h1>
      <MyAdoptions />
    </main>
  )
}
