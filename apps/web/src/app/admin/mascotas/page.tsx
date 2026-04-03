'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/admin'
import { PET_LABELS } from '@/lib/utils'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-50 text-green-700 border-green-200',
  in_process: 'bg-blue-50 text-blue-700 border-blue-200',
  adopted: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function PetsAdmin() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    adminApi.getPets(filter ? { status: filter } : undefined).then((d) => { setPets(d.data); setLoading(false) })
  }, [filter])

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mascotas</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ v: '', l: 'Todas' }, { v: 'available', l: '✅ Disponibles' }, { v: 'in_process', l: '⏳ En proceso' }, { v: 'adopted', l: '🏠 Adoptadas' }].map((s) => (
          <button key={s.v} onClick={() => setFilter(s.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filter === s.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'}`}>
            {s.l}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Nombre', 'Especie', 'Ciudad', 'Fundación', 'Estado', 'Publicada', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pets.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{PET_LABELS.species[p.species]}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.city}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.foundationId?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-4 py-3">
                      <Link href={`/mascotas/${p._id}`} target="_blank" className="text-xs text-primary-600 hover:underline">Ver</Link>
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
