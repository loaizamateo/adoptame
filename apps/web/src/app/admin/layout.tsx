'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',               label: 'Resumen',      emoji: '📊' },
  { href: '/admin/fundaciones',   label: 'Fundaciones',  emoji: '🏢' },
  { href: '/admin/usuarios',      label: 'Usuarios',     emoji: '👥' },
  { href: '/admin/mascotas',      label: 'Mascotas',     emoji: '🐾' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adoptame-auth')
      if (!raw) { router.replace('/login'); return }
      const { state } = JSON.parse(raw)
      if (!state?.accessToken) { router.replace('/login'); return }
      if (state?.user?.role !== 'admin') { router.replace('/'); return }
      setReady(true)
    } catch { router.replace('/login') }
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  const NavLinks = () => (
    <nav className="p-3 flex-1">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href} className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-1',
            active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}>
            <span>{item.emoji}</span>{item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar mobile */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4">
        <span className="font-bold text-primary-600">⚙️ Admin</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </header>

      {menuOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMenuOpen(false)} />}

      <aside className={cn(
        'lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-100 flex flex-col pt-14 transition-transform duration-300',
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-gray-900">Panel Admin</p>
          <p className="text-xs text-gray-400">Adoptame</p>
        </div>
        <NavLinks />
      </aside>

      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex-col">
        <div className="p-5 border-b border-gray-100">
          <p className="font-bold text-gray-900">⚙️ Panel Admin</p>
          <p className="text-xs text-gray-400 mt-0.5">Adoptame</p>
        </div>
        <NavLinks />
        <div className="p-3 border-t border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
            🐾 Dashboard fundación
          </Link>
        </div>
      </aside>

      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">{children}</main>
    </div>
  )
}
