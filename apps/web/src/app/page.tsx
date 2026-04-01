import Link from 'next/link'
import type { Metadata } from 'next'

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

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Adoptame',
  url: 'https://adoptame.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://adoptame.app/adoptar?search={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <span className="text-6xl mb-6 block" aria-hidden="true">🐾</span>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Adopta una mascota en <span className="text-brand-600">Latinoamérica</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Conectamos perros, gatos y más mascotas que buscan hogar con familias amorosas.
            Completamente gratuito para fundaciones y rescatistas.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/adoptar"
              className="bg-brand-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition text-lg"
            >
              Ver mascotas en adopción
            </Link>
            <Link
              href="/fundaciones/nueva"
              className="border border-brand-600 text-brand-600 px-8 py-3 rounded-full font-semibold hover:bg-brand-50 transition text-lg"
            >
              Registrar fundación
            </Link>
          </div>
        </section>

        {/* Especies highlights */}
        <section className="container mx-auto px-4 py-8" aria-label="Categorías de mascotas">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { emoji: '🐶', label: 'Perros', href: '/adoptar?species=dog' },
              { emoji: '🐱', label: 'Gatos', href: '/adoptar?species=cat' },
              { emoji: '🐰', label: 'Otros', href: '/adoptar?species=other' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md hover:border-brand-200 transition group">
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <p className="font-semibold text-gray-700">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 py-16" aria-label="Estadísticas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '🐶', label: 'Mascotas disponibles', value: '—' },
              { emoji: '🏠', label: 'Fundaciones registradas', value: '—' },
              { emoji: '❤️', label: 'Adopciones realizadas', value: '—' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <span className="text-4xl block mb-2" aria-hidden="true">{stat.emoji}</span>
                <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', emoji: '🔍', title: 'Explora mascotas', desc: 'Busca por especie, ciudad, tamaño y más características.' },
              { step: '2', emoji: '📋', title: 'Envía tu solicitud', desc: 'Cuéntale a la fundación sobre ti y tu hogar.' },
              { step: '3', emoji: '🏠', title: '¡Bienvenido a casa!', desc: 'La fundación te contacta y coordina la entrega.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <span className="text-3xl block mb-2">{item.emoji}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Open Source */}
        <section className="bg-brand-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">100% Open Source & Gratuito</h2>
            <p className="text-purple-100 mb-6 max-w-xl mx-auto">
              Adoptame es open source. Fundaciones siempre gratis.
              ¿Eres developer? Contribuye y ayuda a más mascotas a encontrar hogar.
            </p>
            <a
              href="https://github.com/loaizamateo/adoptame"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition inline-block"
            >
              Ver en GitHub ⭐
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
