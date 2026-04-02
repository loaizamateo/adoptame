'use client'

import { useState } from 'react'
import type { LocationState } from '@/hooks/useLocation'

interface Props {
  location: LocationState
  onChangeLocation: (city: string, country: string) => void
}

export function LocationPill({ location, onChangeLocation }: Props) {
  const [open, setOpen] = useState(false)
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onChangeLocation(city.trim(), country.trim())
      setOpen(false)
      setCity('')
      setCountry('')
    }
  }

  if (location.loading) {
    return (
      <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-400 animate-pulse">
        <span>📍</span> Detectando ubicación...
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-colors shadow-soft"
      >
        <span>📍</span>
        <span>{location.city ? location.city + ', ' + location.country : 'Toda Latinoamérica'}</span>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-10 left-0 z-20 bg-white rounded-2xl border border-gray-200 shadow-md p-4 w-72">
            <p className="text-sm font-semibold text-gray-700 mb-3">¿Dónde buscas?</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Ciudad (ej: Bogotá)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                autoFocus
              />
              <input
                type="text"
                placeholder="País (ej: Colombia)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-primary-700 transition mt-1"
              >
                Buscar aquí
              </button>
              <button
                type="button"
                onClick={() => { onChangeLocation('', ''); setOpen(false) }}
                className="text-xs text-gray-400 hover:text-gray-600 transition"
              >
                Ver toda Latinoamérica
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
