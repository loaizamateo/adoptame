import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada — Adoptame',
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl block mb-6">🐾</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition"
          >
            Ir al inicio
          </Link>
          <Link
            href="/adoptar"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-full font-medium hover:border-gray-300 transition"
          >
            Ver mascotas
          </Link>
        </div>
      </div>
    </main>
  )
}
