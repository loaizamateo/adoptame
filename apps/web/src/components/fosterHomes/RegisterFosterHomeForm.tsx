'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFosterHome } from '@/lib/fosterHomes'
import { Button } from '@/components/ui/Button'
import { CitySelect } from '@/components/ui/CitySelect'
import { useAuthStore } from '@/store/auth'

const SPECIES = [
  { value: 'dog', label: '🐶 Perros' },
  { value: 'cat', label: '🐱 Gatos' },
  { value: 'other', label: '🐾 Otros' },
]
const SIZES = [
  { value: 'small', label: 'Pequeños' },
  { value: 'medium', label: 'Medianos' },
  { value: 'large', label: 'Grandes' },
]

export function RegisterFosterHomeForm() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    bio: '',
    city: '',
    country: '',
    phone: '',
    acceptedSpecies: ['dog', 'cat'] as string[],
    acceptedSizes: ['small', 'medium', 'large'] as string[],
    capacity: 1,
    acceptsKids: false,
    acceptsPets: false,
    experience: '',
  })

  const toggle = (key: 'acceptedSpecies' | 'acceptedSizes', val: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated()) { router.push('/login'); return }
    if (!form.city || !form.country) { setError('Seleccioná un país y ciudad válidos'); return }
    if (form.acceptedSpecies.length === 0) { setError('Seleccioná al menos una especie'); return }
    if (form.acceptedSizes.length === 0) { setError('Seleccioná al menos un tamaño'); return }

    setLoading(true)
    setError('')
    try {
      await createFosterHome(form as any)
      router.push('/hogares?registered=1')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del hogar *</label>
        <input
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ej: Hogar de la familia García"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          rows={3}
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Contanos un poco sobre tu hogar, espacio disponible, rutina diaria..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
      </div>

      <CitySelect
        value={form.city}
        country={form.country}
        onCityChange={city => setForm(f => ({ ...f, city }))}
        onCountryChange={country => setForm(f => ({ ...f, country, city: '' }))}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
          <input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+57 300 000 0000"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (mascotas)</label>
          <input
            type="number" min={1} max={10}
            value={form.capacity}
            onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Especies que aceptás *</label>
        <div className="flex gap-2 flex-wrap">
          {SPECIES.map(s => (
            <button
              key={s.value} type="button"
              onClick={() => toggle('acceptedSpecies', s.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${form.acceptedSpecies.includes(s.value) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tamaños que aceptás *</label>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map(s => (
            <button
              key={s.value} type="button"
              onClick={() => toggle('acceptedSizes', s.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${form.acceptedSizes.includes(s.value) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700">Condiciones del hogar</label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox" checked={form.acceptsKids}
            onChange={e => setForm(f => ({ ...f, acceptsKids: e.target.checked }))}
            className="rounded"
          />
          Hay niños en casa
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox" checked={form.acceptsPets}
            onChange={e => setForm(f => ({ ...f, acceptsPets: e.target.checked }))}
            className="rounded"
          />
          Ya hay otras mascotas
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Experiencia con mascotas</label>
        <textarea
          rows={2}
          value={form.experience}
          onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
          placeholder="¿Tuviste mascotas antes? ¿Alguna experiencia especial que quieras compartir?"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full rounded-full mt-2">
        Registrar mi hogar de paso
      </Button>
    </form>
  )
}
