interface DonationLinks {
  nequi?: string
  daviplata?: string
  paypal?: string
  bancolombia?: string
  mercadopago?: string
  other?: string
}

interface Props {
  foundationName: string
  links?: DonationLinks
}

const METHODS = [
  { key: 'nequi',       label: 'Nequi',        emoji: '📱', color: 'bg-pink-50 border-pink-200 text-pink-700',   type: 'phone' },
  { key: 'daviplata',   label: 'Daviplata',     emoji: '📲', color: 'bg-red-50 border-red-200 text-red-700',     type: 'phone' },
  { key: 'bancolombia', label: 'Bancolombia',   emoji: '🏦', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', type: 'account' },
  { key: 'paypal',      label: 'PayPal',        emoji: '💳', color: 'bg-blue-50 border-blue-200 text-blue-700',  type: 'link' },
  { key: 'mercadopago', label: 'MercadoPago',   emoji: '💙', color: 'bg-sky-50 border-sky-200 text-sky-700',    type: 'link' },
  { key: 'other',       label: 'Otro método',   emoji: '💌', color: 'bg-gray-50 border-gray-200 text-gray-700', type: 'other' },
]

export function DonationSection({ foundationName, links }: Props) {
  const available = METHODS.filter((m) => links?.[m.key as keyof DonationLinks])
  if (available.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-primary-50 to-pink-50 border border-primary-100 rounded-2xl p-5 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">❤️</span>
        <div>
          <h3 className="font-semibold text-gray-900">Apoya a {foundationName}</h3>
          <p className="text-xs text-gray-500">Tu donación va directamente a la fundación — 100% a los animales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {available.map((method) => {
          const value = links![method.key as keyof DonationLinks]!
          const isLink = method.type === 'link' && value.startsWith('http')

          if (isLink) {
            return (
              <a
                key={method.key}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition hover:opacity-80 ${method.color}`}
              >
                <span className="text-xl">{method.emoji}</span>
                <div>
                  <p className="font-semibold">{method.label}</p>
                  <p className="text-xs opacity-70">Donar ahora →</p>
                </div>
              </a>
            )
          }

          return (
            <button
              key={method.key}
              onClick={() => {
                navigator.clipboard.writeText(value)
                alert(`${method.label}: ${value}\n\n¡Copiado al portapapeles!`)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition hover:opacity-80 text-left w-full ${method.color}`}
            >
              <span className="text-xl">{method.emoji}</span>
              <div className="min-w-0">
                <p className="font-semibold">{method.label}</p>
                <p className="text-xs opacity-70 truncate">{value}</p>
              </div>
              <span className="ml-auto text-xs opacity-50">📋 Copiar</span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Adoptame no intermedia ningún pago — donas directamente a la fundación
      </p>
    </div>
  )
}
