'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAdoptionRequestSchema, type CreateAdoptionRequestInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createAdoptionRequest } from '@/lib/adoptions'
import { useRouter } from 'next/navigation'
import { trackAdoptionRequest } from '@/lib/analytics'
import { useState, useEffect } from 'react'
import { getPetById } from '@/lib/pets'

interface Props { petId: string }

export default function AdoptionRequestForm({ petId }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [petMeta, setPetMeta] = useState<{ name: string; species: string } | null>(null)

  useEffect(() => {
    getPetById(petId).then(p => setPetMeta({ name: p.name, species: p.species })).catch(() => {})
  }, [petId])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdoptionRequestInput>({
    resolver: zodResolver(createAdoptionRequestSchema),
    defaultValues: { petId, hasYard: false, hasPets: false, hasChildren: false },
  })

  const onSubmit = async (data: CreateAdoptionRequestInput) => {
    setServerError('')
    try {
      await createAdoptionRequest(data)
      trackAdoptionRequest(petId, petMeta?.name ?? '', petMeta?.species ?? '')
      setSuccess(true)
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al enviar la solicitud')
    }
  }

  if (success) {
    return (
      <Card className="text-center py-8">
        <span className="text-6xl block mb-4">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
        <p className="text-gray-500 mb-6">
          La fundación revisará tu solicitud y te contactará pronto.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => router.push('/adoptar')}>
            Ver más mascotas
          </Button>
          <Button onClick={() => router.push('/mis-solicitudes')}>
            Ver mis solicitudes
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <input type="hidden" {...register('petId')} />

        {/* Tipo de vivienda */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿En qué tipo de vivienda vives? *</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'house', emoji: '🏠', label: 'Casa' },
              { value: 'apartment', emoji: '🏢', label: 'Apartamento' },
              { value: 'farm', emoji: '🌳', label: 'Finca / Rural' },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex flex-col items-center gap-1 border rounded-xl p-3 cursor-pointer hover:border-primary-400 transition has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <input type="radio" value={opt.value} className="sr-only" {...register('housingType')} />
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {errors.housingType && <p className="text-xs text-red-500 mt-1">{errors.housingType.message}</p>}
        </div>

        {/* Experiencia */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿Tienes experiencia con mascotas? *</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'none', emoji: '🌱', label: 'Primera vez' },
              { value: 'some', emoji: '🐾', label: 'Algo' },
              { value: 'experienced', emoji: '⭐', label: 'Experiencia' },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex flex-col items-center gap-1 border rounded-xl p-3 cursor-pointer hover:border-primary-400 transition has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <input type="radio" value={opt.value} className="sr-only" {...register('experience')} />
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience.message}</p>}
        </div>

        {/* Checkboxes contextuales */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'hasYard', label: '🌿 Tiene jardín o patio' },
            { name: 'hasPets', label: '🐾 Ya tiene mascotas' },
            { name: 'hasChildren', label: '👶 Hay niños en casa' },
          ].map((cb) => (
            <label key={cb.name} className="flex items-center gap-2 cursor-pointer border rounded-xl p-3 hover:border-primary-300 transition has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input type="checkbox" className="accent-primary-600" {...register(cb.name as any)} />
              <span className="text-xs text-gray-700">{cb.label}</span>
            </label>
          ))}
        </div>

        {/* Horario */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            ¿Cuál es tu horario habitual? *
          </label>
          <textarea
            rows={2}
            placeholder="Ej: Trabajo desde casa, salgo 2h al día. Los fines de semana estoy en casa todo el día."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none"
            {...register('workSchedule')}
          />
          {errors.workSchedule && <p className="text-xs text-red-500">{errors.workSchedule.message}</p>}
        </div>

        {/* Motivación */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            ¿Por qué quieres adoptar esta mascota? *
          </label>
          <textarea
            rows={3}
            placeholder="Cuéntanos qué te motivó a elegir esta mascota y qué puedes ofrecerle..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none"
            {...register('motivation')}
          />
          {errors.motivation && <p className="text-xs text-red-500">{errors.motivation.message}</p>}
        </div>

        {/* Info adicional */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            ¿Algo más que quieras compartir? (opcional)
          </label>
          <textarea
            rows={2}
            placeholder="Referencias, información adicional..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none"
            {...register('additionalInfo')}
          />
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-full">
          ❤️ Enviar solicitud de adopción
        </Button>
      </form>
    </Card>
  )
}
