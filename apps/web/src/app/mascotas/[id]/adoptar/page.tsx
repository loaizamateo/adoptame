import type { Metadata } from 'next'
import AdoptionRequestForm from '@/components/adoptions/AdoptionRequestForm'

export const metadata: Metadata = { title: 'Solicitar adopción' }

interface Props { params: { id: string } }

export default function AdoptRequestPage({ params }: Props) {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitar adopción</h1>
      <p className="text-gray-500 mb-6">
        Cuéntanos sobre ti para que la fundación pueda evaluar tu solicitud.
      </p>
      <AdoptionRequestForm petId={params.id} />
    </main>
  )
}
