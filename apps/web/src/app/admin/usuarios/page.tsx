'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/admin'

const ROLE_LABELS: Record<string, string> = { admin: '⚙️ Admin', foundation: '🏢 Fundación', adopter: '🐾 Adoptante' }

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const data = await adminApi.getUsers()
    setUsers(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id: string) => {
    setToggling(id)
    await adminApi.toggleUser(id)
    await load()
    setToggling(null)
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Nombre', 'Email', 'Rol', 'Estado', 'Registrado', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${u.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleToggle(u._id)} disabled={toggling === u._id}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition disabled:opacity-50 ${u.active ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>
                          {toggling === u._id ? '...' : u.active ? 'Suspender' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
