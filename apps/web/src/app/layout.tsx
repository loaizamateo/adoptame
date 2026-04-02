import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://adoptame.app'),
  title: {
    default: 'Adoptame — Adopta mascotas en Latinoamérica',
    template: '%s | Adoptame',
  },
  description:
    'Plataforma open source de adopción animal. Conectamos mascotas que buscan hogar con familias amorosas en Colombia, México, Argentina y toda Latinoamérica.',
  keywords: [
    'adopción mascotas',
    'perros en adopción',
    'gatos en adopción',
    'adoptar perro colombia',
    'adoptar gato latinoamérica',
    'fundaciones animales',
    'rescate animal',
    'adopción responsable',
  ],
  authors: [{ name: 'Adoptame', url: 'https://adoptame.app' }],
  creator: 'Adoptame',
  openGraph: {
    title: 'Adoptame — Adopta mascotas en Latinoamérica',
    description: 'Conectamos mascotas con familias amorosas. Gratis para fundaciones y rescatistas.',
    url: 'https://adoptame.app',
    siteName: 'Adoptame',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Adoptame — Adopta mascotas en Latinoamérica',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adoptame — Adopta mascotas en Latinoamérica',
    description: 'Conectamos mascotas con familias amorosas.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
