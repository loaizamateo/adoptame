'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFoundationSchema, type CreateFoundationInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createFoundation } from '@/lib/foundations'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewFoundationForm() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateFoundationInput>({ resolver: zodResolver(createFoundationSchema) })

  if (!user) {
    return (
      <Card className="text-center">
        <p className="text-gray-500">Debes iniciar sesión para registrar una fundación.</p>
      </Card>
    )
  }

  const onSubmit = async (data: CreateFoundationInput) => {
    setServerError('')
    try {
      const foundation = await createFoundation(data)
      router.push(`/fundaciones/${foundation.slug}`)
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al crear la fundación')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Nombre de la fundación *"
          placeholder="Ej: Fundación Huellitas Felices"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Descripción *</label>
          <textarea
            rows={4}
            placeholder="Cuéntanos sobre tu organización, misión y cómo ayudan a las mascotas..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 resize-none"
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ciudad *"
            placeholder="Bogotá"
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label="País *"
            placeholder="Colombia"
            error={errors.country?.message}
            {...register('country')}
          />
        </div>
        <Input
          label="Teléfono / WhatsApp"
          placeholder="+57 300 000 0000"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Sitio web"
          type="url"
          placeholder="https://mifundacion.org"
          error={errors.website?.message}
          {...register('website')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Instagram"
            placeholder="@mifundacion"
            error={errors.instagram?.message}
            {...register('instagram')}
          />
          <Input
            label="Facebook"
            placeholder="mifundacion"
            error={errors.facebook?.message}
            {...register('facebook')}
          />
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-full">
          Registrar fundación
        </Button>
      </form>
    </Card>
  )
}
