import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MarketplaceFeed } from '@/components/home/MarketplaceFeed'
import { SearchBar } from '@/components/search/SearchBar'

export const metadata: Metadata = {
  alternates: { canonical: 'https://adoptame.app' },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Adoptame',
  url: 'https://adoptame.app',
  logo: 'https://adoptame.app/logo.png',
  description: 'Plataforma open source de adopción animal para Latinoamérica',
  sameAs: ['https://github.com/loaizamateo/adoptame'],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <main className="min-h-screen bg-gray-50">

        {/* Hero compacto */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="container mx-auto px-4 py-14 text-center">

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Encuentra a tu compañero<br />
              <span className="text-accent-300">ideal para adoptar</span>
            </h1>
            <p className="text-primary-100 text-lg mb-6 max-w-xl mx-auto">
              Conectamos mascotas que buscan hogar con familias amorosas en toda Latinoamérica.
            </p>

            {/* Buscador unificado */}
            <div className="mb-6 px-4">
              <SearchBar />
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/adoptar"
                className="bg-accent-500 text-white px-7 py-3 rounded-full font-semibold hover:bg-accent-600 transition shadow-soft text-base"
              >
                Explorar mascotas
              </Link>
              <Link
                href="/register?role=foundation"
                className="bg-white/10 border border-white/30 text-white px-7 py-3 rounded-full font-semibold hover:bg-white/20 transition text-base"
              >
                Soy fundación →
              </Link>
            </div>
          </div>
        </section>

        {/* Marketplace con geolocalización */}
        <MarketplaceFeed />

        {/* Stats rápidos */}
        <section className="bg-white border-t border-gray-100 py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-6 text-center max-w-lg mx-auto">
              {[
                { value: '100%', label: 'Gratis para fundaciones' },
                { value: 'LATAM', label: 'Toda Latinoamérica' },
                { value: 'Open', label: 'Código abierto' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-primary-600">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA fundaciones */}
        <section className="bg-gradient-to-r from-primary-600 to-accent-500 text-white py-14">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">¿Tienes una fundación o rescatas animales?</h2>
            <p className="text-primary-100 mb-6 max-w-xl mx-auto">
              Publica tus mascotas gratis y conéctalas con familias que las están buscando.
            </p>
            <Link
              href="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition inline-block"
            >
              Registrar fundación →
            </Link>
          </div>
        </section>

      </main>
    </>
  )
}
