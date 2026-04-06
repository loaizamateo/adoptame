import { sendEmail, emailTemplates } from '../services/email'
import { FastifyInstance } from 'fastify'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@adoptame/schemas'
import { z } from 'zod'
import { User } from '../models/User'
import { Foundation } from '../models/Foundation'
import { env } from '../config/env'
import crypto from 'crypto'
import type { JwtPayload } from '../types/fastify'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
})

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function authRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  // POST /auth/register
  fastify.post('/register', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const existing = await User.findOne({ email: body.data.email })
    if (existing) {
      return reply.status(409).send({ success: false, error: 'El email ya está registrado' })
    }

    const user = await User.create(body.data)

    const accessToken = fastify.jwt.sign(
      { userId: user._id, role: user.role },
      { expiresIn: env.JWT_EXPIRES_IN }
    )
    const refreshToken = fastify.jwt.sign(
      { userId: user._id, type: 'refresh', tokenVersion: user.tokenVersion },
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    )

    return reply.status(201).send({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      },
    })
  })

  // POST /auth/login
  fastify.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const user = await User.findOne({ email: body.data.email }).select('+password')
    if (!user || !user.password) {
      return reply.status(401).send({ success: false, error: 'Credenciales inválidas' })
    }

    if (!user.active) {
      return reply.status(403).send({ success: false, error: 'Cuenta suspendida' })
    }

    const valid = await user.comparePassword(body.data.password)
    if (!valid) {
      return reply.status(401).send({ success: false, error: 'Credenciales inválidas' })
    }

    const accessToken = fastify.jwt.sign(
      { userId: user._id, role: user.role },
      { expiresIn: env.JWT_EXPIRES_IN }
    )
    const refreshToken = fastify.jwt.sign(
      { userId: user._id, type: 'refresh', tokenVersion: user.tokenVersion },
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    )

    return reply.send({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      },
    })
  })

  // POST /auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }
    if (!refreshToken) {
      return reply.status(400).send({ success: false, error: 'refreshToken requerido' })
    }

    try {
      const payload = fastify.jwt.verify<JwtPayload>(refreshToken)
      if (payload.type !== 'refresh') throw new Error('Token inválido')

      const user = await User.findById(payload.userId)
      if (!user || !user.active) {
        return reply.status(401).send({ success: false, error: 'Usuario no encontrado o inactivo' })
      }

      if (payload.tokenVersion !== user.tokenVersion) {
        return reply.status(401).send({ success: false, error: 'Token inválido o expirado' })
      }

      const accessToken = fastify.jwt.sign(
        { userId: user._id, role: user.role },
        { expiresIn: env.JWT_EXPIRES_IN }
      )

      return reply.send({ success: true, data: { accessToken } })
    } catch {
      return reply.status(401).send({ success: false, error: 'Token inválido o expirado' })
    }
  })

  // GET /auth/me
  fastify.get('/me', { onRequest: [authenticate] }, async (request, reply) => {
    const user = await User.findById(request.user.userId)
    if (!user) return reply.status(404).send({ success: false, error: 'Usuario no encontrado' })

    let foundation = null
    if (user.foundationId) {
      foundation = await Foundation.findById(user.foundationId)
    }

    return reply.send({ success: true, data: { user, foundation } })
  })

  // PATCH /auth/me — actualizar perfil
  fastify.patch('/me', { onRequest: [authenticate] }, async (request, reply) => {
    const body = updateProfileSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const user = await User.findByIdAndUpdate(
      request.user.userId,
      body.data,
      { new: true, runValidators: true }
    )

    return reply.send({ success: true, data: user })
  })

  // POST /auth/forgot-password
  fastify.post('/forgot-password', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const body = forgotPasswordSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const user = await User.findOne({ email: body.data.email })
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      user.resetPasswordToken = hashToken(rawToken)
      user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hora
      await user.save()
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`
      const tpl = emailTemplates.resetPassword(user.name, resetUrl)
      sendEmail({ to: user.email, ...tpl }).catch((err) => request.log.error(err, 'email: error enviando reset password'))
    }

    return reply.send({
      success: true,
      message: 'Si el email existe, recibirás instrucciones en breve.',
    })
  })

  // POST /auth/reset-password
  fastify.post('/reset-password', async (request, reply) => {
    const body = resetPasswordSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(body.data.token),
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return reply.status(400).send({ success: false, error: 'Token inválido o expirado' })
    }

    user.password = body.data.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return reply.send({ success: true, message: 'Contraseña actualizada correctamente' })
  })

  // GET /auth/validate-reset-token/:token
  fastify.get<{ Params: { token: string } }>('/validate-reset-token/:token', async (request, reply) => {
    const { token } = request.params
    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    })
    return reply.send({ success: true, data: { valid: !!user } })
  })

  // POST /auth/logout
  fastify.post('/logout', { onRequest: [authenticate] }, async (request, reply) => {
    await User.findByIdAndUpdate(request.user.userId, { $inc: { tokenVersion: 1 } })
    return reply.send({ success: true, message: 'Sesión cerrada correctamente' })
  })
}
