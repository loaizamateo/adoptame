import Link from 'next/link'
import type { Foundation } from '@adoptame/types'

interface Props {
  foundation: Foundation
}

export function FoundationCard({ foundation }: Props) {
  return (
    <Link href={`/fundaciones/${foundation.slug}`}>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary-200 transition-all group">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {foundation.logo ? (
              <img src={foundation.logo} alt={foundation.name} className="w-full h-full object-cover" />
            ) : (
              '🐾'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition truncate">
                {foundation.name}
              </h3>
              {foundation.verified && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                  ✓ Verificada
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              📍 {foundation.city}, {foundation.country}
            </p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{foundation.description}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
          {foundation.instagram && <span>Instagram</span>}
          {foundation.website && <span>Web</span>}
          {foundation.facebook && <span>Facebook</span>}
        </div>
      </div>
    </Link>
  )
}
