'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { updateFoundation } from '@/lib/foundations'

interface Props {
  foundationId: string
  initialLinks?: {
    nequi?: string
    daviplata?: string
    paypal?: string
    bancolombia?: string
    mercadopago?: string
    other?: string
  }
}

export function DonationLinksForm({ foundationId, initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (key: string, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateFoundation(foundationId, { donationLinks: links })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Error al guardar los métodos de donación')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">❤️</span>
        <div>
          <h2 className="font-semibold text-gray-900">Métodos de donación</h2>
          <p className="text-sm text-gray-500">
            Permite que las personas apoyen tu fundación directamente desde tu perfil público.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="📱 Nequi (número)"
            placeholder="3001234567"
            value={links.nequi ?? ''}
            onChange={(e) => handleChange('nequi', e.target.value)}
          />
          <Input
            label="📲 Daviplata (número)"
            placeholder="3001234567"
            value={links.daviplata ?? ''}
            onChange={(e) => handleChange('daviplata', e.target.value)}
          />
          <Input
            label="🏦 Bancolombia (número de cuenta)"
            placeholder="12345678901"
            value={links.bancolombia ?? ''}
            onChange={(e) => handleChange('bancolombia', e.target.value)}
          />
          <Input
            label="💳 PayPal (link paypal.me)"
            placeholder="https://paypal.me/mifundacion"
            value={links.paypal ?? ''}
            onChange={(e) => handleChange('paypal', e.target.value)}
          />
          <Input
            label="💙 MercadoPago (link de cobro)"
            placeholder="https://link.mercadopago.com/..."
            value={links.mercadopago ?? ''}
            onChange={(e) => handleChange('mercadopago', e.target.value)}
          />
          <Input
            label="💌 Otro método"
            placeholder="Cualquier otro link o instrucción"
            value={links.other ?? ''}
            onChange={(e) => handleChange('other', e.target.value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
          💡 <strong>Adoptame no cobra comisión.</strong> Las donaciones van directamente a ti — solo publicamos tu info de pago.
        </div>

        {saved && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">✅ Métodos de donación guardados</p>
        )}

        <Button onClick={handleSave} loading={saving} className="rounded-full">
          Guardar métodos de pago
        </Button>
      </div>
    </Card>
  )
}
