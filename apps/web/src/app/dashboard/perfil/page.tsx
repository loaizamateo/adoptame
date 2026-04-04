'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateFoundationSchema, type UpdateFoundationInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DonationLinksForm } from '@/components/dashboard/DonationLinksForm'
import { CitySelect } from '@/components/ui/CitySelect'
import { updateFoundation } from '@/lib/foundations'
import { api } from '@/lib/api'
import type { Foundation } from '@adoptame/types'

export default function DashboardProfilePage() {
  const [foundation, setFoundation] = useState<(Foundation & { donationLinks?: any }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')
  const [profileCity, setProfileCity] = useState('')
  const [profileCountry, setProfileCountry] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFoundationInput>({ resolver: zodResolver(updateFoundationSchema) })

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      const f = res.data.data.foundation
      setFoundation(f)
      if (f) {
        reset(f)
        setProfileCity(f.city || '')
        setProfileCountry(f.country || '')
      }
    }).finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data: UpdateFoundationInput) => {
    if (!foundation) return
    setServerError('')
    setSaved(false)
    try {
      const updated = await updateFoundation(foundation._id, { ...data, city: profileCity, country: profileCountry })
      setFoundation((prev) => ({ ...updated, donationLinks: prev?.donationLinks }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al guardar')
    }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-96 bg-gray-100 rounded-2xl" /></div>

  if (!foundation) return (
    <div className="p-8 text-center text-gray-500">
      <p>No se encontró tu fundación.</p>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil de la fundación</h1>

      {/* Datos generales */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input label="Nombre *" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Descripción *</label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none"
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <CitySelect
            value={profileCity}
            country={profileCountry}
            onCityChange={setProfileCity}
            onCountryChange={(c) => { setProfileCountry(c); setProfileCity('') }}
            error={errors.city?.message || errors.country?.message}
            required
          />
          <Input label="Teléfono / WhatsApp" {...register('phone')} />
          <Input label="Sitio web" type="url" placeholder="https://" {...register('website')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Instagram" placeholder="@cuenta" {...register('instagram')} />
            <Input label="Facebook" placeholder="pagina" {...register('facebook')} />
          </div>

          {serverError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>}
          {saved && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">✅ Cambios guardados</p>}

          <Button type="submit" loading={isSubmitting} className="rounded-full">
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* Métodos de donación */}
      <DonationLinksForm
        foundationId={foundation._id}
        initialLinks={foundation.donationLinks}
      />
    </div>
  )
}
