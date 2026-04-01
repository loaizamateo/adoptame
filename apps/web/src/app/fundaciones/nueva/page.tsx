import type { Metadata } from 'next'
import NewFoundationForm from '@/components/foundations/NewFoundationForm'

export const metadata: Metadata = {
  title: 'Registrar fundación',
}

export default function NewFoundationPage() {
  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registrar fundación</h1>
        <p className="text-gray-500 mt-2">
          Crea el perfil de tu organización y empieza a publicar mascotas en adopción.
        </p>
      </div>
      <NewFoundationForm />
    </main>
  )
}
