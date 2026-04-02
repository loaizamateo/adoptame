import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🐾</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Bienvenido de nuevo</h1>
          <p className="text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
