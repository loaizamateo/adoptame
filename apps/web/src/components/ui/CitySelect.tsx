'use client'

import { useState, useRef, useEffect } from 'react'
import { LOCATIONS, COUNTRIES, type City } from '@adoptame/schemas'

interface Props {
  value: string
  country: string
  onCityChange: (city: string) => void
  onCountryChange: (country: string) => void
  error?: string
  required?: boolean
}

export function CitySelect({ value, country, onCityChange, onCountryChange, error, required }: Props) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredCities: City[] = LOCATIONS.filter(l => {
    const matchesCountry = !country || l.country === country
    const matchesQuery = !query || l.city.toLowerCase().includes(query.toLowerCase())
    return matchesCountry && matchesQuery
  }).slice(0, 8)

  // Sincronizar query cuando value cambia externamente
  useEffect(() => { setQuery(value || '') }, [value])

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // Si el texto no coincide con una ciudad válida, limpiar
        const valid = LOCATIONS.find(l => l.city === query && (!country || l.country === country))
        if (!valid && query) {
          setQuery('')
          onCityChange('')
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query, country, onCityChange])

  const handleSelect = (loc: City) => {
    setQuery(loc.city)
    onCityChange(loc.city)
    onCountryChange(loc.country)
    setOpen(false)
  }

  const handleCountryChange = (newCountry: string) => {
    onCountryChange(newCountry)
    setQuery('')
    onCityChange('')
  }

  const isValidCity = LOCATIONS.some(l => l.city === query && (!country || l.country === country))

  return (
    <div className="flex flex-col gap-3">
      {/* País */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          País {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={country}
          onChange={e => handleCountryChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
        >
          <option value="">Seleccionar país...</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Ciudad */}
      <div ref={containerRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); onCityChange('') }}
          onFocus={() => setOpen(true)}
          placeholder={country ? 'Buscar ciudad...' : 'Primero seleccioná el país'}
          disabled={!country}
          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-gray-50 disabled:text-gray-400 ${
            error ? 'border-red-300' : isValidCity ? 'border-green-300' : 'border-gray-200'
          }`}
        />

        {/* Dropdown */}
        {open && country && (
          <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-52 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500 text-center">
                <p className="font-medium text-gray-700 mb-1">Ciudad no disponible</p>
                <p className="text-xs text-gray-400">
                  ¿No encontrás tu ciudad?{' '}
                  <a
                    href="mailto:hola@adoptame.app"
                    className="text-primary-600 hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    Contáctanos para agregarla
                  </a>
                </p>
              </div>
            ) : (
              filteredCities.map(loc => (
                <button
                  key={loc.city}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 transition flex items-center justify-between"
                >
                  <span className="font-medium text-gray-800">{loc.city}</span>
                  <span className="text-xs text-gray-400">{loc.country}</span>
                </button>
              ))
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  )
}
