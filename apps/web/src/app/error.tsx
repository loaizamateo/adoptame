'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl block mb-6">🐾</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-gray-500 mb-6">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-full font-medium hover:border-gray-300 transition"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </main>
  )
}
