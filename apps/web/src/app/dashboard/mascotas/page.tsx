'use client'

import { useEffect, useState } from 'react'
import { getMyPets, deletePet, updatePet } from '@/lib/pets'
import type { Pet } from '@adoptame/types'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PET_LABELS } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  available:  'bg-green-50 text-green-700 border-green-200',
  in_process: 'bg-blue-50 text-blue-700 border-blue-200',
  adopted:    'bg-primary-50 text-primary-700 border-primary-200',
}
const STATUS_LABELS: Record<string, string> = {
  available: '✅ Disponible', in_process: '⏳ En proceso', adopted: '🏠 Adoptado',
}

export default function DashboardPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  useEffect(() => {
    async function load() {
      try {
        const res = await getMyPets()
        setPets(res.data)
      } catch {
        // silencioso
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (petId: string, petName: string) => {
    if (!confirm(`¿Eliminar a ${petName}? Esta acción no se puede deshacer.`)) return
    setDeleting(petId)
    try {
      await deletePet(petId)
      setPets((prev) => prev.filter((p) => p._id !== petId))
    } catch {
      alert('Error al eliminar la mascota')
    } finally {
      setDeleting(null)
    }
  }

  const handleStatusChange = async (petId: string, status: string) => {
    try {
      const updated = await updatePet(petId, { status })
      setPets((prev) => prev.map((p) => (p._id === petId ? updated : p)))
    } catch {
      alert('Error al actualizar el estado')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis mascotas</h1>
        <Link href="/dashboard/mascotas/nueva">
          <Button className="rounded-full">+ Publicar mascota</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-6xl block mb-3">🐾</span>
          <p className="font-medium text-gray-600">Aún no has publicado mascotas</p>
          <p className="text-sm mt-1">Empieza publicando tu primera mascota en adopción</p>
          <Link href="/dashboard/mascotas/nueva" className="mt-4 inline-block">
            <Button className="rounded-full mt-2">Publicar primera mascota</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Mascota</th>
                <th className="text-left px-4 py-3">Especie</th>
                <th className="text-left px-4 py-3">Ciudad</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Urgente</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {pet.photos?.[0] ? (
                          <img src={pet.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            {pet.species === 'dog' ? '🐶' : '🐱'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pet.name}</p>
                        <p className="text-xs text-gray-400">{pet.breed || PET_LABELS.species[pet.species]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{PET_LABELS.species[pet.species]}</td>
                  <td className="px-4 py-3 text-gray-600">{pet.city}</td>
                  <td className="px-4 py-3">
                    <select
                      value={pet.status}
                      onChange={(e) => handleStatusChange(pet._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer ${STATUS_COLORS[pet.status]}`}
                    >
                      <option value="available">✅ Disponible</option>
                      <option value="in_process">⏳ En proceso</option>
                      <option value="adopted">🏠 Adoptado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {pet.urgent ? <span className="text-red-500 font-bold">🚨</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/mascotas/${pet._id}`} target="_blank">
                        <Button variant="ghost" size="sm">👁</Button>
                      </Link>
                      <Link href={`/dashboard/mascotas/${pet._id}/editar`}>
                        <Button variant="ghost" size="sm">✏️</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={deleting === pet._id}
                        onClick={() => handleDelete(pet._id, pet.name)}
                        className="text-red-400 hover:text-red-600"
                      >
                        🗑
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
