'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/admin'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function FoundationsAdmin() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'pending' ? 'pending' : 'all')
  const [foundations, setFoundations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const data = await adminApi.getFoundations(tab === 'pending' ? false : undefined)
    setFoundations(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const handleVerify = async (id: string, verified: boolean) => {
    setUpdating(id)
    await adminApi.verifyFoundation(id, verified)
    await load()
    setUpdating(null)
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fundaciones</h1>
      <div className="flex gap-2 mb-6">
        {[{ v: 'all', l: 'Todas' }, { v: 'pending', l: '⏳ Sin verificar' }].map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${tab === t.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : foundations.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p>No hay fundaciones con este filtro</p></div>
      ) : (
        <div className="space-y-3">
          {foundations.map((f: any) => (
            <div key={f._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{f.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${f.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {f.verified ? '✅ Verificada' : '⏳ Pendiente'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{f.ownerId?.email} · {f.city}, {f.country}</p>
                <p className="text-xs text-gray-400">Registrada {new Date(f.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/fundaciones/${f.slug}`} target="_blank" className="text-sm text-primary-600 hover:underline">Ver perfil</Link>
                {f.verified ? (
                  <button onClick={() => handleVerify(f._id, false)} disabled={updating === f._id}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-50">
                    {updating === f._id ? '...' : 'Revocar'}
                  </button>
                ) : (
                  <button onClick={() => handleVerify(f._id, true)} disabled={updating === f._id}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition disabled:opacity-50">
                    {updating === f._id ? '...' : '✅ Verificar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <Suspense><FoundationsAdmin /></Suspense>
}
