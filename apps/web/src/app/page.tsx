import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <span className="text-6xl mb-6 block">🐾</span>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Encuentra tu compañero <span className="text-brand-600">ideal</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Conectamos mascotas que buscan hogar con familias amorosas en toda Latinoamérica.
          Completamente gratuito para fundaciones y rescatistas.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/adoptar"
            className="bg-brand-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition"
          >
            Ver mascotas
          </Link>
          <Link
            href="/fundaciones"
            className="border border-brand-600 text-brand-600 px-8 py-3 rounded-full font-semibold hover:bg-brand-50 transition"
          >
            Soy una fundación
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { emoji: '🐶', label: 'Mascotas disponibles', value: '—' },
            { emoji: '🏠', label: 'Fundaciones registradas', value: '—' },
            { emoji: '❤️', label: 'Adopciones realizadas', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-8 shadow-sm border">
              <span className="text-4xl block mb-2">{stat.emoji}</span>
              <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
              <p className="text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Open Source */}
      <section className="bg-brand-600 text-white py-16 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Open Source & Gratuito</h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Adoptame es 100% open source. ¿Eres desarrollador? Contribuye y ayuda a más mascotas
            a encontrar hogar.
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
  )
}
