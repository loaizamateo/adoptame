import { FosterHome } from '@/lib/fosterHomes'

const speciesLabel: Record<string, string> = { dog: '🐶 Perros', cat: '🐱 Gatos', other: '🐾 Otros' }
const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' }
const statusLabel: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-green-100 text-green-700' },
  occupied:  { label: 'Ocupado',    color: 'bg-yellow-100 text-yellow-700' },
  inactive:  { label: 'Inactivo',   color: 'bg-gray-100 text-gray-500' },
}

export function FosterHomeCard({ home }: { home: FosterHome }) {
  const st = statusLabel[home.status]
  const available = home.capacity - home.currentCount

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{home.name}</h3>
          <p className="text-sm text-gray-500">{home.city}, {home.country}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
      </div>

      {home.bio && <p className="text-sm text-gray-600 line-clamp-2">{home.bio}</p>}

      <div className="flex flex-wrap gap-1.5">
        {home.acceptedSpecies.map(s => (
          <span key={s} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{speciesLabel[s]}</span>
        ))}
        {home.acceptedSizes.map(s => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sizeLabel[s]}</span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm border-t pt-3 mt-auto">
        <span className="text-gray-500">
          {available > 0
            ? <><span className="font-semibold text-primary-600">{available}</span> lugar{available > 1 ? 'es' : ''} disponible{available > 1 ? 's' : ''}</>
            : <span className="text-yellow-600 font-medium">Sin espacio disponible</span>
          }
        </span>
        <div className="flex gap-2 text-xs text-gray-500">
          {home.acceptsKids && <span>✅ Niños</span>}
          {home.acceptsPets && <span>✅ Otras mascotas</span>}
        </div>
      </div>
    </div>
  )
}
