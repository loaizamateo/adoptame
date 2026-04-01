import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/adoptar', '/mascotas/', '/fundaciones/'],
        disallow: ['/dashboard/', '/mis-solicitudes/', '/api/'],
      },
    ],
    sitemap: 'https://adoptame.app/sitemap.xml',
  }
}
