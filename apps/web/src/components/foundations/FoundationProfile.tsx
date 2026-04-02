'use client'

import { useEffect, useState } from 'react'
import { getFoundationBySlug } from '@/lib/foundations'
import type { Foundation, Pet } from '@adoptame/types'
import { DonationSection } from './DonationSection'
import Link from 'next/link'
import Image from 'next/image'

interface Props { slug: string }

export default function FoundationProfile({ slug }: Props) {
  const [data, setData] = useState<{ foundation: Foundation & { donationLinks?: any }; pets: Pet[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFoundationBySlug(slug)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 animate-pulse">
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">😢</span>
        <h1 className="text-xl font-bold text-gray-900">Fundación no encontrada</h1>
        <Link href="/fundaciones" className="text-brand-600 mt-2 inline-block hover:underline">
          Ver todas las fundaciones
        </Link>
      </div>
    )
  }

  const { foundation, pets } = data

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-600">Inicio</Link>
        <span>/</span>
        <Link href="/fundaciones" className="hover:text-brand-600">Fundaciones</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">{foundation.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden relative">
            {foundation.logo
              ? <Image src={foundation.logo} alt={foundation.name} fill className="object-cover" sizes="80px" />
              : '🐾'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{foundation.name}</h1>
              {foundation.verified && (
                <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                  ✓ Verificada
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">📍 {foundation.city}, {foundation.country}</p>
            <p className="text-gray-700 mt-3 leading-relaxed">{foundation.description}</p>
            <div className="flex gap-4 mt-4 text-sm flex-wrap">
              {foundation.website && (
                <a href={foundation.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">🌐 Sitio web</a>
              )}
              {foundation.instagram && (
                <a href={`https://instagram.com/${foundation.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">📸 Instagram</a>
              )}
              {foundation.facebook && (
                <a href={`https://facebook.com/${foundation.facebook}`} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">👤 Facebook</a>
              )}
              {foundation.phone && (
                <a href={`https://wa.me/${foundation.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">💬 WhatsApp</a>
              )}
            </div>
          </div>
        </div>

        {/* Sección de donaciones */}
        <DonationSection
          foundationName={foundation.name}
          links={(foundation as any).donationLinks}
        />
      </div>

      {/* Mascotas disponibles */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Mascotas en adopción ({pets.length})
        </h2>
        {pets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">🐾</span>
            <p>No hay mascotas disponibles actualmente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pets.map((pet: any) => (
              <Link key={pet._id} href={`/mascotas/${pet._id}`}>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition group">
                  <div className="aspect-square bg-gray-50 relative">
                    {pet.photos?.[0] ? (
                      <Image src={pet.photos[0]} alt={pet.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'}
                      </div>
                    )}
                    {pet.urgent && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Urgente</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition">{pet.name}</p>
                    <p className="text-xs text-gray-400">{pet.breed || pet.species}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
