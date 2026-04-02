'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@adoptame/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError('')
    try {
      const res = await api.post('/auth/login', data)
      const { user, tokens } = res.data.data
      setAuth(user, tokens)
      router.push(user.role === 'foundation' ? '/dashboard' : '/adoptar')
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Error al iniciar sesión')
    }
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
        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full rounded-full">
          Iniciar sesión
        </Button>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary-600 font-semibold hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </form>
    </Card>
  )
}
