import { FastifyInstance } from 'fastify'
import { createFoundationSchema, updateFoundationSchema } from '@adoptame/schemas'
import { Foundation } from '../models/Foundation'
import { User } from '../models/User'
import { Pet } from '../models/Pet'

export async function foundationRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

  // GET /foundations — listado público
  fastify.get('/', async (request, reply) => {
    const query = request.query as any
    const filter: Record<string, any> = {}
    if (query.city) filter.city = new RegExp(query.city, 'i')
    if (query.country) filter.country = query.country
    if (query.verified === 'true') filter.verified = true

    const foundations = await Foundation.find(filter).sort({ verified: -1, createdAt: -1 })
    return reply.send({ success: true, data: foundations })
  })

  // GET /foundations/:slug — perfil público
  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as any
    const foundation = await Foundation.findOne({ slug })
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

    const pets = await Pet.find({ foundationId: foundation._id, status: 'available' })
      .sort({ urgent: -1, createdAt: -1 })
      .limit(12)

    return reply.send({ success: true, data: { foundation, pets } })
  })

  // POST /foundations — registrar fundación
  fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    const existing = await Foundation.findOne({ ownerId: user.userId })
    if (existing) {
      return reply.status(409).send({ success: false, error: 'Ya tienes una fundación registrada' })
    }

    const body = createFoundationSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const foundation = await Foundation.create({ ...body.data, ownerId: user.userId })
    await User.findByIdAndUpdate(user.userId, { role: 'foundation', foundationId: foundation._id })

    return reply.status(201).send({ success: true, data: foundation })
  })

  // PATCH /foundations/:id
  fastify.patch('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params as any
    const user = (request as any).user

    const foundation = await Foundation.findById(id)
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })
    if (foundation.ownerId.toString() !== user.userId) {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    const body = updateFoundationSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    Object.assign(foundation, body.data)
    await foundation.save()

    return reply.send({ success: true, data: foundation })
  })
}
