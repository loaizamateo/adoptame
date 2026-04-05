'use client'

import { useEffect, useState } from 'react'
import { getMyAdoptions } from '@/lib/adoptions'
import type { AdoptionRequest } from '@adoptame/types'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  pending:   { label: 'Pendiente',   color: 'bg-yellow-50 text-yellow-700 border-yellow-200', emoji: '⏳' },
  reviewing: { label: 'En revisión', color: 'bg-blue-50 text-blue-700 border-blue-200',       emoji: '🔍' },
  approved:  { label: 'Aprobada',    color: 'bg-green-50 text-green-700 border-green-200',    emoji: '✅' },
  rejected:  { label: 'Rechazada',   color: 'bg-red-50 text-red-700 border-red-200',          emoji: '❌' },
  completed: { label: 'Completada',  color: 'bg-primary-50 text-primary-700 border-primary-200', emoji: '🎉' },
}

export default function MyAdoptions() {
  const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getMyAdoptions()
      .then(setAdoptions)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
  }

  if (error) {
    return (
      <div className="text-center py-16 text-gray-400">
        <span className="text-5xl block mb-3">⚠️</span>
        <p>No se pudieron cargar tus solicitudes. Intenta de nuevo.</p>
      </div>
    )
  }

  if (adoptions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <span className="text-5xl block mb-3">🐾</span>
        <p className="font-medium">Aún no has enviado solicitudes</p>
        <Link href="/adoptar" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
          Explorar mascotas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {adoptions.map((a: any) => {
        const st = STATUS_LABELS[a.status] || STATUS_LABELS.pending
        return (
          <div key={a._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              {a.petId?.photos?.[0] ? (
                <img src={a.petId.photos[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{a.petId?.name ?? 'Mascota'}</p>
              <p className="text-xs text-gray-400">{a.foundationId?.name}</p>
              <p className="text-xs text-gray-300 mt-0.5">
                {new Date(a.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {a.notes && <p className="text-xs text-gray-500 mt-1 italic">"{a.notes}"</p>}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${st.color}`}>
              {st.emoji} {st.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
