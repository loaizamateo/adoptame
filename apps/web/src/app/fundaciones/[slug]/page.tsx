import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FoundationProfile from '@/components/foundations/FoundationProfile'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/foundations/${params.slug}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { title: 'Fundación | Adoptame' }
    const { data: { foundation } } = await res.json()

    const title = `${foundation.name} — Fundación en ${foundation.city} | Adoptame`
    const description = `${foundation.description.slice(0, 155)}`
    const image = foundation.logo ?? 'https://adoptame.app/og-default.png'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://adoptame.app/fundaciones/${params.slug}`,
        siteName: 'Adoptame',
        images: [{ url: image, width: 1200, height: 630, alt: foundation.name }],
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
        canonical: `https://adoptame.app/fundaciones/${params.slug}`,
      },
    }
  } catch {
    return { title: 'Fundación | Adoptame' }
  }
}

export default function FoundationPage({ params }: Props) {
  if (!params.slug) notFound()
  return <FoundationProfile slug={params.slug} />
}
