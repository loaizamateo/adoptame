import type { Metadata } from 'next'
import PetsExplorer from '@/components/pets/PetsExplorer'

export const metadata: Metadata = {
  title: 'Adoptar mascotas — Perros y gatos en adopción',
  description:
    'Encuentra perros, gatos y más mascotas en adopción en Colombia, México, Argentina y toda Latinoamérica. Filtra por ciudad, tamaño, edad, especie y más.',
  keywords: [
    'adoptar perro', 'adoptar gato', 'mascotas en adopción', 'perros en adopción colombia',
    'gatos en adopción', 'adopción responsable', 'rescate animal latinoamérica',
  ],
  openGraph: {
    title: 'Adoptar mascotas — Perros y gatos en adopción | Adoptame',
    description: 'Busca mascotas en adopción en toda Latinoamérica. Gratis, fácil y con fundaciones verificadas.',
    url: 'https://adoptame.app/adoptar',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://adoptame.app/adoptar' },
}

export default function AdoptarPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mascotas en adopción</h1>
        <p className="text-gray-500 mt-1">
          Encuentra a tu próximo compañero de vida en toda Latinoamérica 🐾
        </p>
      </header>
      <PetsExplorer />
    </main>
  )
}
