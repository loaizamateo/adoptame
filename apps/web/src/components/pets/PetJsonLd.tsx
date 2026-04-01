interface Props {
  pet: {
    _id: string
    name: string
    species: string
    description: string
    photos: string[]
    city: string
    country: string
    foundation?: { name: string }
  }
}

export function PetJsonLd({ pet }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${pet.name} — en adopción en ${pet.city}`,
    description: pet.description,
    image: pet.photos?.[0] ?? 'https://adoptame.app/og-default.png',
    url: `https://adoptame.app/mascotas/${pet._id}`,
    publisher: {
      '@type': 'Organization',
      name: pet.foundation?.name ?? 'Adoptame',
      url: 'https://adoptame.app',
      logo: { '@type': 'ImageObject', url: 'https://adoptame.app/logo.png' },
    },
    locationCreated: {
      '@type': 'Place',
      name: `${pet.city}, ${pet.country}`,
    },
    keywords: `adopción mascotas, ${pet.species === 'dog' ? 'perro' : 'gato'} en adopción, ${pet.city}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
