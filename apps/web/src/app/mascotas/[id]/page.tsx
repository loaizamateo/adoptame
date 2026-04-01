import type { Metadata } from 'next'
import PetDetail from '@/components/pets/PetDetail'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Mascota en adopción' }

export default function PetPage({ params }: Props) {
  return <PetDetail id={params.id} />
}
