import type { Metadata } from 'next'
import { FavoritesPets } from '@/components/pets/FavoritesPets'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mis favoritos — Adoptame',
  description: 'Mascotas que has guardado para adoptar',
}

export default function FavoritosPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <Heart size={20} className="text-red-500" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis favoritos</h1>
          <p className="text-sm text-gray-400">Mascotas que has guardado</p>
        </div>
      </div>
      <FavoritesPets />
    </main>
  )
}
