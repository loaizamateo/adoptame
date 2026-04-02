'use client'

import { useEffect, useState } from 'react'
import { FoundationCard } from './FoundationCard'
import { getFoundations } from '@/lib/foundations'
import type { Foundation } from '@adoptame/types'

export default function FoundationsList() {
  const [foundations, setFoundations] = useState<Foundation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getFoundations()
      .then(setFoundations)
      .finally(() => setLoading(false))
  }, [])

  const filtered = foundations.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.city.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">🔍</span>
          <p>No se encontraron fundaciones</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <FoundationCard key={f._id} foundation={f} />
          ))}
        </div>
      )}
    </div>
  )
}
