import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Adoptame — Adopta una mascota en Latinoamérica',
    template: '%s | Adoptame',
  },
  description:
    'Plataforma open source de adopción animal. Conectamos mascotas con familias amorosas en toda Latinoamérica.',
  keywords: ['adopción mascotas', 'perros en adopción', 'gatos en adopción', 'latinoamérica'],
  openGraph: {
    title: 'Adoptame — Adopta una mascota en Latinoamérica',
    description: 'Conectamos mascotas con familias amorosas.',
    url: 'https://adoptame.app',
    siteName: 'Adoptame',
    locale: 'es_CO',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
