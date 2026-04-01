import { FastifyInstance } from 'fastify'
import { loginSchema, registerSchema, forgotPasswordSchema } from '@adoptame/schemas'
import { User } from '../models/User'
import { Foundation } from '../models/Foundation'
import { env } from '../config/env'
import crypto from 'crypto'

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/register
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const existing = await User.findOne({ email: body.data.email })
    if (existing) {
      return reply.status(409).send({ success: false, error: 'El email ya está registrado' })
    }

    const user = await User.create(body.data)

    const accessToken = fastify.jwt.sign({ userId: user._id, role: user.role }, { expiresIn: env.JWT_EXPIRES_IN })
    const refreshToken = fastify.jwt.sign({ userId: user._id, type: 'refresh' }, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })

    return reply.status(201).send({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      },
    })
  })

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const user = await User.findOne({ email: body.data.email }).select('+password')
    if (!user || !user.password) {
      return reply.status(401).send({ success: false, error: 'Credenciales inválidas' })
    }

    const valid = await user.comparePassword(body.data.password)
    if (!valid) {
      return reply.status(401).send({ success: false, error: 'Credenciales inválidas' })
    }

    const accessToken = fastify.jwt.sign({ userId: user._id, role: user.role }, { expiresIn: env.JWT_EXPIRES_IN })
    const refreshToken = fastify.jwt.sign({ userId: user._id, type: 'refresh' }, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })

    return reply.send({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      },
    })
  })

  // GET /auth/me
  fastify.get('/me', { onRequest: [(fastify as any).authenticate] }, async (request, reply) => {
    const payload = request.user as any
    const user = await User.findById(payload.userId)
    if (!user) return reply.status(404).send({ success: false, error: 'Usuario no encontrado' })

    let foundation = null
    if (user.foundationId) {
      foundation = await Foundation.findById(user.foundationId)
    }

    return reply.send({ success: true, data: { user, foundation } })
  })

  // POST /auth/forgot-password
  fastify.post('/forgot-password', async (request, reply) => {
    const body = forgotPasswordSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const user = await User.findOne({ email: body.data.email })
    // Siempre responder OK para no revelar emails registrados
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      user.resetPasswordToken = token
      user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hora
      await user.save()
      // TODO: Enviar email con Resend
    }

    return reply.send({ success: true, message: 'Si el email existe, recibirás instrucciones.' })
  })
}
