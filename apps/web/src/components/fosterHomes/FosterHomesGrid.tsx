'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFosterHomes, FosterHome, FosterHomeFilters } from '@/lib/fosterHomes'
import { FosterHomeCard } from './FosterHomeCard'
import { FosterHomeFilters as FiltersBar } from './FosterHomeFilters'

export function FosterHomesGrid() {
  const [homes, setHomes] = useState<FosterHome[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [filters, setFilters] = useState<FosterHomeFilters>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (f: FosterHomeFilters) => {
    setLoading(true)
    try {
      const data = await getFosterHomes({ ...f, status: 'available' })
      setHomes(data.homes)
      setPagination(data.pagination)
    } catch {
      setHomes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filters) }, [filters, load])

  const handleFiltersChange = (f: any) => {
    setFilters({ ...f, page: 1 })
  }

  return (
    <div>
      <FiltersBar onChange={handleFiltersChange} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : homes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-lg font-medium">No hay hogares disponibles con esos filtros</p>
          <p className="text-sm mt-1">Probá cambiando la ciudad o la especie</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{pagination.total} hogar{pagination.total !== 1 ? 'es' : ''} encontrado{pagination.total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {homes.map(h => <FosterHomeCard key={h._id} home={h} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
