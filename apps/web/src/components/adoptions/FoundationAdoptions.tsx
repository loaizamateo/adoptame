'use client'

import { useEffect, useState } from 'react'
import { getFoundationAdoptions, updateAdoptionStatus } from '@/lib/adoptions'
import type { AdoptionRequest } from '@adoptame/types'
import { Button } from '@/components/ui/Button'

const STATUSES = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: '⏳ Pendientes' },
  { value: 'reviewing', label: '🔍 En revisión' },
  { value: 'approved', label: '✅ Aprobadas' },
  { value: 'rejected', label: '❌ Rechazadas' },
  { value: 'completed', label: '🎉 Completadas' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  approved:  'bg-green-50 text-green-700 border-green-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-primary-50 text-primary-700 border-primary-200',
}

export default function FoundationAdoptions() {
  const [adoptions, setAdoptions] = useState<AdoptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchAdoptions = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getFoundationAdoptions(filter || undefined)
      setAdoptions(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdoptions() }, [filter])

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      await updateAdoptionStatus(id, status, notes || undefined)
      setExpanded(null)
      setNotes('')
      await fetchAdoptions()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      {/* Filtro de estado */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === s.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : error ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">⚠️</span>
          <p className="mb-4">No se pudieron cargar las solicitudes</p>
          <button onClick={fetchAdoptions} className="text-primary-600 font-medium hover:underline text-sm">Reintentar</button>
        </div>
      ) : adoptions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">📭</span>
          <p>No hay solicitudes con este estado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adoptions.map((a: any) => (
            <div key={a._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Fila principal */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpanded(expanded === a._id ? null : a._id)}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {a.petId?.photos?.[0] ? (
                    <img src={a.petId.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{a.petId?.name ?? 'Mascota'}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Solicitante: <strong>{a.userId?.name}</strong> · {a.userId?.email}</p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="text-gray-300">{expanded === a._id ? '▲' : '▼'}</span>
              </div>

              {/* Detalle expandible */}
              {expanded === a._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <Info label="Vivienda" value={a.housingType} />
                    <Info label="Jardín" value={a.hasYard ? 'Sí' : 'No'} />
                    <Info label="Mascotas" value={a.hasPets ? 'Sí tiene' : 'No tiene'} />
                    <Info label="Niños" value={a.hasChildren ? 'Sí' : 'No'} />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Horario:</p>
                    <p className="text-gray-600">{a.workSchedule}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Motivación:</p>
                    <p className="text-gray-600">{a.motivation}</p>
                  </div>
                  {a.additionalInfo && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-1">Info adicional:</p>
                      <p className="text-gray-600">{a.additionalInfo}</p>
                    </div>
                  )}

                  {/* Acciones */}
                  {!['completed', 'rejected'].includes(a.status) && (
                    <div className="border-t border-gray-200 pt-3">
                      <textarea
                        rows={2}
                        placeholder="Nota para el adoptante (opcional)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none mb-3"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {a.status === 'pending' && (
                          <Button size="sm" variant="secondary" loading={updating === a._id} onClick={() => handleStatus(a._id, 'reviewing')}>
                            🔍 Poner en revisión
                          </Button>
                        )}
                        {['pending', 'reviewing'].includes(a.status) && (
                          <>
                            <Button size="sm" loading={updating === a._id} onClick={() => handleStatus(a._id, 'approved')}>
                              ✅ Aprobar
                            </Button>
                            <Button size="sm" variant="danger" loading={updating === a._id} onClick={() => handleStatus(a._id, 'rejected')}>
                              ❌ Rechazar
                            </Button>
                          </>
                        )}
                        {a.status === 'approved' && (
                          <Button size="sm" loading={updating === a._id} onClick={() => handleStatus(a._id, 'completed')}>
                            🎉 Marcar adoptado
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-2 border border-gray-100">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-800 capitalize">{value}</p>
    </div>
  )
}
