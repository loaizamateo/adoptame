import type { Metadata } from 'next'
import PetDetail from '@/components/pets/PetDetail'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pets/${id}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { title: 'Mascota en adopción | Adoptame' }
    const { data: pet } = await res.json()

    const speciesLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Mascota' }
    const ageLabel: Record<string, string> = { puppy: 'cachorro', young: 'joven', adult: 'adulto', senior: 'senior' }
    const species = speciesLabel[pet.species] ?? 'Mascota'
    const age = ageLabel[pet.age] ?? ''
    const title = `${pet.name} — ${species} en adopción en ${pet.city} | Adoptame`
    const description = `${pet.name} es un ${species.toLowerCase()} ${age} en adopción en ${pet.city}, ${pet.country}. ${pet.description.slice(0, 120)}...`
    const image = pet.photos?.[0] ?? 'https://adoptame.app/og-default.png'

    return {
      title,
      description,
      keywords: [
        `${species.toLowerCase()} en adopción`,
        `adoptar ${species.toLowerCase()} ${pet.city}`,
        pet.breed ?? '',
        pet.city,
        pet.country,
        'adopción mascotas latinoamérica',
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        url: `https://adoptame.app/mascotas/${id}`,
        siteName: 'Adoptame',
        images: [{ url: image, width: 1200, height: 630, alt: `${pet.name} en adopción` }],
        locale: 'es_CO',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `https://adoptame.app/mascotas/${id}`,
      },
    }
  } catch {
    return { title: 'Mascota en adopción | Adoptame' }
  }
}

export default async function PetPage({ params }: Props) {
  const { id } = await params
  return <PetDetail id={id} />
}
