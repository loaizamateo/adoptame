'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useFavoritesStore } from '@/store/favorites'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { Heart, Menu, X } from 'lucide-react'
import { api } from '@/lib/api'

const NAV_LINKS = [
  { href: '/adoptar', label: 'Adoptar' },
  { href: '/fundaciones', label: 'Fundaciones' },
  { href: '/hogares', label: 'Hogares de paso' },
  { href: 'https://github.com/loaizamateo/adoptame', label: 'Open Source ⭐', external: true },
]

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const favCount = useFavoritesStore((s) => s.count())
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { /* best-effort */ }
    logout()
    setMobileOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Image src="/logo-icon.png" alt="Adoptame" width={38} height={38} className="object-contain" />
          <span className="font-bold text-xl text-primary-600">Adoptame</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              className="hover:text-primary-600 transition font-medium"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Favorites */}
          <Link
            href="/favoritos"
            aria-label="Mis favoritos"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <Heart size={18} />
            {favCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {favCount > 99 ? '99+' : favCount}
              </span>
            )}
          </Link>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated() && user ? (
              <>
                {user.role === 'foundation' && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Salir</Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Ingresar</Button></Link>
                <Link href="/register"><Button size="sm" className="rounded-full">Registrarse</Button></Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-black/20 z-40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-lg">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  target={l.external ? '_blank' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-3 rounded-xl text-gray-700 font-medium hover:bg-primary-50 hover:text-primary-600 transition"
                >
                  {l.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
                {isAuthenticated() && user ? (
                  <>
                    {user.role === 'foundation' && (
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                        <Button variant="secondary" className="w-full">Dashboard</Button>
                      </Link>
                    )}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {user.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>Salir</Button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="secondary" className="w-full">Ingresar</Button>
                    </Link>
                    <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full rounded-full">Registrarse</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
