import type { Metadata } from 'next'
import { RegisterFosterHomeForm } from '@/components/fosterHomes/RegisterFosterHomeForm'

export const metadata: Metadata = {
  title: 'Registrar hogar de paso',
  description: 'Registrate como hogar de paso y ayudá a las mascotas rescatadas a tener un lugar seguro mientras encuentran su familia definitiva.',
}

export default function RegistrarHogarPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ser hogar de paso</h1>
        <p className="text-gray-500 mt-1">
          Completá tu perfil para que las fundaciones puedan encontrarte 🏠🐾
        </p>
      </div>
      <RegisterFosterHomeForm />
    </main>
  )
}
