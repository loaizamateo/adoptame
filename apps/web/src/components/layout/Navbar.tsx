'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Adoptame" width={36} height={36} className="rounded-lg object-cover" />
          <span className="font-bold text-xl text-primary-600">Adoptame</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/adoptar" className="hover:text-primary-600 transition font-medium">Adoptar</Link>
          <Link href="/fundaciones" className="hover:text-primary-600 transition font-medium">Fundaciones</Link>
          <Link href="https://github.com/loaizamateo/adoptame" target="_blank" className="hover:text-primary-600 transition font-medium">
            Open Source ⭐
          </Link>
        </div>

        <div className="flex items-center gap-3">
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
              <Link href="/login">
                <Button variant="ghost" size="sm">Ingresar</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
