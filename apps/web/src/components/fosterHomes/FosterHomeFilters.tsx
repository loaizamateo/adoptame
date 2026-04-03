'use client'

import { useState } from 'react'

interface Filters {
  city: string
  species: string
  size: string
}

export function FosterHomeFilters({ onChange }: { onChange: (f: Filters) => void }) {
  const [filters, setFilters] = useState<Filters>({ city: '', species: '', size: '' })

  const update = (key: keyof Filters, value: string) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Ciudad..."
        value={filters.city}
        onChange={e => update('city', e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-40"
      />
      <select
        value={filters.species}
        onChange={e => update('species', e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        <option value="">Todas las especies</option>
        <option value="dog">🐶 Perros</option>
        <option value="cat">🐱 Gatos</option>
        <option value="other">🐾 Otros</option>
      </select>
      <select
        value={filters.size}
        onChange={e => update('size', e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        <option value="">Todos los tamaños</option>
        <option value="small">Pequeño</option>
        <option value="medium">Mediano</option>
        <option value="large">Grande</option>
      </select>
    </div>
  )
}
