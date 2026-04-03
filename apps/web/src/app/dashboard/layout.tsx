'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',             label: 'Resumen',       emoji: '📊' },
  { href: '/dashboard/mascotas',    label: 'Mis mascotas',  emoji: '🐾' },
  { href: '/dashboard/solicitudes', label: 'Solicitudes',   emoji: '📋' },
  { href: '/dashboard/perfil',      label: 'Perfil',        emoji: '⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setAuth } = useAuthStore()
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adoptame-auth')
      if (!raw) { router.replace('/login'); return }
      const parsed = JSON.parse(raw)
      const state = parsed?.state ?? parsed
      if (!state?.accessToken) { router.replace('/login'); return }
      if (state?.user?.role !== 'foundation') { router.replace('/'); return }
      if (!user && state.user) {
        setAuth(state.user, { accessToken: state.accessToken, refreshToken: state.refreshToken })
      }
      setReady(true)
    } catch {
      router.replace('/login')
    }
  }, [])

  // Cerrar menú al navegar
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="p-3 flex-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-1',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <Link
          href="/adoptar"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
        >
          <span>🌐</span> Ver sitio
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Topbar mobile */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 shadow-soft h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="Adoptame" width={28} height={28} className="object-contain" />
          <span className="font-bold text-primary-600">Dashboard</span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
          aria-label="Menú"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar mobile (drawer) */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 pt-14',
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex-col pt-16">
        <SidebarContent />
      </aside>

      {/* Contenido */}
      <main className="lg:ml-56 pt-14 lg:pt-16 min-h-screen">
        {children}
      </main>

    </div>
  )
}
