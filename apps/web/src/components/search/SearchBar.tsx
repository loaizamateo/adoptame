'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api'
import { trackSearch } from '@/lib/analytics'

interface PetResult {
  _id: string
  name: string
  species: string
  breed?: string
  city: string
  photos?: string[]
}

interface FoundationResult {
  _id: string
  name: string
  slug: string
  city: string
  logo?: string
  verified: boolean
}

interface SearchResults {
  pets: PetResult[]
  foundations: FoundationResult[]
}

const SPECIES_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' }

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); setOpen(false); return }
    setLoading(true)
    try {
      const res = await api.get('/search', { params: { q } })
      setResults(res.data)
      setOpen(true)
      trackSearch(q, res.data.pets?.length ?? 0, res.data.foundations?.length ?? 0)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hasResults = results && (results.pets.length > 0 || results.foundations.length > 0)
  const isEmpty = results && results.pets.length === 0 && results.foundations.length === 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push('/adoptar?q=' + encodeURIComponent(query.trim()))
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 gap-3">
          <span className="text-xl flex-shrink-0">
            {loading
              ? <span className="inline-block w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              : '🔍'}
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (hasResults) setOpen(true) }}
            placeholder="Busca una mascota, raza, ciudad o fundación..."
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults(null); setOpen(false) }}
              className="text-gray-300 hover:text-gray-500 transition text-lg leading-none"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {isEmpty && (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              <p className="text-2xl mb-1">🐾</p>
              <p>Sin resultados para <strong>{query}</strong></p>
            </div>
          )}

          {results && results.pets.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">Mascotas</p>
              {results.pets.map(pet => (
                <button
                  key={pet._id}
                  onClick={() => { setOpen(false); router.push('/mascotas/' + pet._id) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                    {pet.photos?.[0]
                      ? <Image src={pet.photos[0]} alt={pet.name} fill className="object-cover" sizes="40px" />
                      : <span className="w-full h-full flex items-center justify-center text-xl">{SPECIES_EMOJI[pet.species] ?? '🐾'}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{pet.name}</p>
                    <p className="text-xs text-gray-400 truncate">{pet.breed ? pet.breed + ' · ' : ''}{pet.city}</p>
                  </div>
                  <span className="ml-auto text-xs text-primary-500 flex-shrink-0">Ver →</span>
                </button>
              ))}
            </div>
          )}

          {results && results.foundations.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">Fundaciones</p>
              {results.foundations.map(f => (
                <button
                  key={f._id}
                  onClick={() => { setOpen(false); router.push('/fundaciones/' + f.slug) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex-shrink-0 overflow-hidden relative flex items-center justify-center text-xl">
                    {f.logo
                      ? <Image src={f.logo} alt={f.name} fill className="object-cover" sizes="40px" />
                      : '🏠'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {f.name}{f.verified && <span className="text-green-500 text-xs ml-1">✓</span>}
                    </p>
                    <p className="text-xs text-gray-400">{f.city}</p>
                  </div>
                  <span className="ml-auto text-xs text-primary-500 flex-shrink-0">Ver →</span>
                </button>
              ))}
            </div>
          )}

          {hasResults && (
            <button
              onClick={() => { setOpen(false); router.push('/adoptar?q=' + encodeURIComponent(query)) }}
              className="w-full px-4 py-3 text-sm text-primary-600 font-medium hover:bg-primary-50 transition border-t border-gray-100 text-center"
            >
              Ver todos los resultados para "{query}" →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
