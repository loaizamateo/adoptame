'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError('')
    try {
      const res = await api.post('/auth/register', data)
      const { user, tokens } = res.data.data
      setAuth(user, tokens)
      router.push('/adoptar')
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al crear la cuenta')
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          placeholder="María García"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres, una mayúscula y un número"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">¿Cómo quieres usar Adoptame?</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'adopter', emoji: '🏠', label: 'Quiero adoptar' },
              { value: 'foundation', emoji: '🐾', label: 'Soy una fundación' },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex flex-col items-center gap-1 border rounded-xl p-3 cursor-pointer hover:border-brand-400 transition has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
              >
                <input type="radio" value={opt.value} className="sr-only" {...register('role')} />
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-full">
          Crear cuenta gratis
        </Button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </Card>
  )
}
