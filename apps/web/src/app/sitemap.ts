import type { MetadataRoute } from 'next'

const BASE_URL = 'https://adoptame.app'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/adoptar`,     lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/fundaciones`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/login`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    // Mascotas disponibles
    const petsRes = await fetch(`${API_URL}/pets?limit=200&status=available`, {
      next: { revalidate: 3600 },
    })
    const petsData = petsRes.ok ? await petsRes.json() : null
    const petRoutes: MetadataRoute.Sitemap = (petsData?.data?.data ?? []).map((pet: any) => ({
      url: `${BASE_URL}/mascotas/${pet._id}`,
      lastModified: new Date(pet.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: pet.urgent ? 0.9 : 0.7,
    }))

    // Fundaciones verificadas
    const foundationsRes = await fetch(`${API_URL}/foundations?verified=true`, {
      next: { revalidate: 3600 },
    })
    const foundationsData = foundationsRes.ok ? await foundationsRes.json() : null
    const foundationRoutes: MetadataRoute.Sitemap = (foundationsData?.data ?? []).map((f: any) => ({
      url: `${BASE_URL}/fundaciones/${f.slug}`,
      lastModified: new Date(f.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...petRoutes, ...foundationRoutes]
  } catch {
    return staticRoutes
  }
}
