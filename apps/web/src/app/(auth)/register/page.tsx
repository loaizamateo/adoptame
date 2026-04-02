import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🐾</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Crear cuenta</h1>
          <p className="text-gray-500 mt-1">Únete y ayuda a mascotas a encontrar hogar</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
