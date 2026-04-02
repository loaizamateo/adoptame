'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: ForgotPasswordInput) => {
    await api.post('/auth/forgot-password', data)
    setSent(true)
  }

  if (sent) {
    return (
      <Card className="text-center">
        <span className="text-4xl block mb-4">📧</span>
        <h2 className="font-bold text-gray-900 mb-2">Revisa tu correo</h2>
        <p className="text-gray-500 text-sm mb-4">
          Si el email está registrado, recibirás instrucciones para recuperar tu contraseña.
        </p>
        <Link href="/login" className="text-primary-600 text-sm font-semibold hover:underline">
          Volver al inicio de sesión
        </Link>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-full">
          Enviar instrucciones
        </Button>
        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-primary-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </Card>
  )
}
