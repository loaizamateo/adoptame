import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Nueva contraseña</h1>
          <p className="text-gray-500 mt-1">Elige una contraseña segura</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
