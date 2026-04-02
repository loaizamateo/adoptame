'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPets } from '@/lib/pets'
import { PetCard } from './PetCard'
import { PetCardSkeleton } from './PetCardSkeleton'
import type { Pet, PetFilters } from '@adoptame/types'
import { Button } from '@/components/ui/Button'

const SPECIES = [
  { value: '', label: 'Todos', emoji: '🐾' },
  { value: 'dog', label: 'Perros', emoji: '🐶' },
  { value: 'cat', label: 'Gatos', emoji: '🐱' },
  { value: 'other', label: 'Otros', emoji: '🐰' },
]

const SIZES = [
  { value: '', label: 'Cualquier tamaño' },
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
]

const AGES = [
  { value: '', label: 'Cualquier edad' },
  { value: 'puppy', label: 'Cachorro' },
  { value: 'young', label: 'Joven' },
  { value: 'adult', label: 'Adulto' },
  { value: 'senior', label: 'Senior' },
]

export default function PetsExplorer() {
  const [pets, setPets] = useState<Pet[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState<PetFilters>({
    species: undefined,
    size: undefined,
    age: undefined,
    city: undefined,
    urgent: undefined,
  })
  const [search, setSearch] = useState('')

  const fetchPets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPets({ ...filters, search: search || undefined, page, limit: 12 })
      setPets(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } finally {
      setLoading(false)
    }
  }, [filters, search, page])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const setFilter = (key: keyof PetFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setPage(1)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Panel de filtros */}
      <aside className="lg:w-56 flex-shrink-0">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sticky top-20 space-y-5">
          {/* Búsqueda */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, raza..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* Especie */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Especie</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {SPECIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilter('species', s.value as any)}
                  className={`flex flex-col items-center py-2 rounded-xl border text-xs font-medium transition ${
                    (filters.species ?? '') === s.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-100 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tamaño</label>
            <select
              value={filters.size ?? ''}
              onChange={(e) => setFilter('size', e.target.value as any)}
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-500"
            >
              {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Edad */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edad</label>
            <select
              value={filters.age ?? ''}
              onChange={(e) => setFilter('age', e.target.value as any)}
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-500"
            >
              {AGES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ciudad</label>
            <input
              type="text"
              placeholder="Bogotá, Medellín..."
              value={filters.city ?? ''}
              onChange={(e) => setFilter('city', e.target.value)}
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* Urgentes */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.urgent === true}
              onChange={(e) => setFilter('urgent', e.target.checked ? true : undefined)}
              className="rounded accent-primary-600"
            />
            <span className="text-sm text-gray-700">🚨 Solo urgentes</span>
          </label>

          {/* Limpiar */}
          <button
            onClick={() => { setFilters({}); setSearch(''); setPage(1) }}
            className="text-xs text-gray-400 hover:text-primary-600 transition"
          >
            Limpiar filtros
          </button>
        </div>
      </aside>

      {/* Grid de mascotas */}
      <div className="flex-1">
        <p className="text-sm text-gray-400 mb-4">
          {loading ? 'Buscando...' : `${total} mascota${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => <PetCardSkeleton key={i} />)}
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-6xl block mb-3">🔍</span>
            <p className="font-medium">No encontramos mascotas con esos filtros</p>
            <p className="text-sm mt-1">Intenta con otros criterios</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {pets.map((pet) => <PetCard key={pet._id} pet={pet} />)}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  ← Anterior
                </Button>
                <span className="text-sm text-gray-500 flex items-center px-3">
                  {page} / {totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
