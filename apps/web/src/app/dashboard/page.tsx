'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/lib/dashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Stats {
  pets: { total: number; available: number; inProcess: number; adopted: number; urgent: number }
  requests: { total: number; pending: number; reviewing: number }
  adoptionsByMonth: { _id: string; count: number }[]
  foundation: any
}

function StatCard({ emoji, value, label, href, alert }: any) {
  const card = (
    <div className={`bg-white border rounded-2xl p-5 hover:shadow-sm transition ${alert ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-3xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!stats) return <div className="p-8 text-gray-500">Error cargando estadísticas</div>

  const { pets, requests } = stats
  const needsAttention = requests.pending + requests.reviewing

  return (
    <div className="p-8">
      {/* Bienvenida */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {stats.foundation.name} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {stats.foundation.verified
              ? '✓ Fundación verificada'
              : '⏳ Verificación pendiente — contacta al equipo de Adoptame'}
          </p>
        </div>
        <Link href="/dashboard/mascotas/nueva">
          <Button className="rounded-full">+ Publicar mascota</Button>
        </Link>
      </div>

      {/* Alerta solicitudes pendientes */}
      {needsAttention > 0 && (
        <Link href="/dashboard/solicitudes">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3 hover:bg-amber-100 transition">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-semibold text-amber-800">
                Tienes {needsAttention} solicitud{needsAttention > 1 ? 'es' : ''} que requieren atención
              </p>
              <p className="text-sm text-amber-600">
                {requests.pending} pendiente{requests.pending !== 1 ? 's' : ''} · {requests.reviewing} en revisión
              </p>
            </div>
            <span className="ml-auto text-amber-400">→</span>
          </div>
        </Link>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard emoji="🐾" value={pets.available} label="Disponibles" href="/dashboard/mascotas" />
        <StatCard emoji="⏳" value={pets.inProcess} label="En proceso" href="/dashboard/mascotas" />
        <StatCard emoji="🏠" value={pets.adopted}  label="Adoptados" />
        <StatCard emoji="🚨" value={pets.urgent}   label="Urgentes"  alert={pets.urgent > 0} href="/dashboard/mascotas" />
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solicitudes recientes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Solicitudes</h2>
            <Link href="/dashboard/solicitudes" className="text-sm text-primary-600 hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total recibidas', value: requests.total, color: 'text-gray-900' },
              { label: 'Pendientes',      value: requests.pending,   color: 'text-yellow-600' },
              { label: 'En revisión',     value: requests.reviewing, color: 'text-blue-600' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{row.label}</span>
                <span className={`font-bold text-lg ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico simple de adopciones por mes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Adopciones completadas</h2>
          {stats.adoptionsByMonth.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-3xl block mb-2">📈</span>
              <p className="text-sm">Aún no hay adopciones completadas</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {stats.adoptionsByMonth.map((m) => {
                const max = Math.max(...stats.adoptionsByMonth.map((x) => x.count))
                const height = max > 0 ? Math.round((m.count / max) * 100) : 0
                const monthLabel = new Date(m._id + '-01').toLocaleDateString('es-CO', { month: 'short' })
                return (
                  <div key={m._id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-primary-600">{m.count}</span>
                    <div
                      className="w-full bg-primary-100 rounded-t-lg transition-all"
                      style={{ height: `${height}%`, minHeight: 4 }}
                    />
                    <span className="text-xs text-gray-400">{monthLabel}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/mascotas/nueva">
            <Button variant="secondary" size="sm" className="rounded-full">🐾 Nueva mascota</Button>
          </Link>
          <Link href="/dashboard/solicitudes?status=pending">
            <Button variant="secondary" size="sm" className="rounded-full">📋 Ver pendientes</Button>
          </Link>
          <Link href="/dashboard/perfil">
            <Button variant="secondary" size="sm" className="rounded-full">⚙️ Editar perfil</Button>
          </Link>
          <Link href={`/fundaciones/${stats.foundation.slug}`} target="_blank">
            <Button variant="secondary" size="sm" className="rounded-full">🌐 Ver perfil público</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
