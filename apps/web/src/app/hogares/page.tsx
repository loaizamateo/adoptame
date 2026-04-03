import type { Metadata } from 'next'
import { FosterHomesGrid } from '@/components/fosterHomes/FosterHomesGrid'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Hogares de paso — Acoge temporalmente una mascota',
  description: 'Encuentra hogares de paso disponibles en Colombia y Latinoamérica, o regístrate para acoger temporalmente una mascota mientras encuentra su familia definitiva.',
  openGraph: {
    title: 'Hogares de paso | Adoptame',
    description: 'Sé parte del cambio: acoge temporalmente una mascota y ayudala a encontrar hogar.',
    url: 'https://adoptame.app/hogares',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://adoptame.app/hogares' },
}

export default function HogaresPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hogares de paso</h1>
          <p className="text-gray-500 mt-1">
            Familias que acogen temporalmente mascotas mientras encuentran su hogar definitivo 🏠
          </p>
        </div>
        <Link href="/hogares/registrar">
          <Button className="rounded-full whitespace-nowrap">+ Ser hogar de paso</Button>
        </Link>
      </div>

      <div className="bg-accent-50 border border-accent-100 rounded-2xl p-4 mb-8 flex gap-3">
        <span className="text-2xl">💡</span>
        <div className="text-sm text-gray-700">
          <strong>¿Qué es un hogar de paso?</strong> Es una familia o persona que recibe temporalmente a una mascota rescatada mientras la fundación busca su hogar definitivo.
          No implica adopción, pero sí amor, cuidado y paciencia. 🐾
        </div>
      </div>

      <FosterHomesGrid />
    </main>
  )
}
