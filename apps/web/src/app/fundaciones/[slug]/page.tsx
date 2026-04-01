import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FoundationProfile from '@/components/foundations/FoundationProfile'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Fundación — ${params.slug}`,
  }
}

export default function FoundationPage({ params }: Props) {
  if (!params.slug) notFound()
  return <FoundationProfile slug={params.slug} />
}
