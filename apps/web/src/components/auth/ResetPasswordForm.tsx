'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError('')
    try {
      await api.post('/auth/reset-password', data)
      router.push('/login?reset=success')
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al cambiar la contraseña')
    }
  }

  if (!token) {
    return (
      <Card className="text-center">
        <p className="text-red-500">Enlace inválido. Solicita uno nuevo.</p>
        <Link href="/forgot-password" className="text-brand-600 text-sm mt-2 inline-block hover:underline">
          Solicitar nuevo enlace
        </Link>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...register('token')} />
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres, una mayúscula y un número"
          error={errors.password?.message}
          {...register('password')}
        />
        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-full">
          Cambiar contraseña
        </Button>
      </form>
    </Card>
  )
}
