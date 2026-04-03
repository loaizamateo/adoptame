'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/admin'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => { adminApi.getStats().then(setStats) }, [])

  if (!stats) return (
    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  const cards = [
    { emoji: '🏢', value: stats.foundations, label: 'Fundaciones', href: '/admin/fundaciones' },
    { emoji: '⏳', value: stats.pending,     label: 'Sin verificar', href: '/admin/fundaciones?tab=pending', alert: stats.pending > 0 },
    { emoji: '✅', value: stats.verified,    label: 'Verificadas', href: '/admin/fundaciones' },
    { emoji: '🐾', value: stats.pets,        label: 'Mascotas',    href: '/admin/mascotas' },
    { emoji: '👥', value: stats.users,       label: 'Usuarios',    href: '/admin/usuarios' },
    { emoji: '🎉', value: stats.adopted,     label: 'Adopciones completadas' },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen global</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => {
          const card = (
            <div className={`bg-white border rounded-2xl p-5 hover:shadow-sm transition ${c.alert ? 'border-amber-300 bg-amber-50' : 'border-gray-100'}`}>
              <span className="text-2xl">{c.emoji}</span>
              <p className={`text-3xl font-bold mt-2 ${c.alert ? 'text-amber-700' : 'text-gray-900'}`}>{c.value}</p>
              <p className="text-sm text-gray-500 mt-1">{c.label}</p>
            </div>
          )
          return c.href ? <Link key={c.label} href={c.href}>{card}</Link> : <div key={c.label}>{card}</div>
        })}
      </div>
      {stats.pending > 0 && (
        <Link href="/admin/fundaciones?tab=pending" className="block bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition">
          <p className="font-semibold text-amber-800">🔔 {stats.pending} fundación{stats.pending > 1 ? 'es' : ''} esperando verificación</p>
          <p className="text-sm text-amber-600 mt-0.5">Revisar y verificar →</p>
        </Link>
      )}
    </div>
  )
}
