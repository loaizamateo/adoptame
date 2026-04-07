import { FastifyInstance } from 'fastify'
import { createFoundationSchema, updateFoundationSchema } from '@adoptame/schemas'
import { Foundation } from '../models/Foundation'
import { User } from '../models/User'
import { Pet } from '../models/Pet'
import { signPhotoUrlsBatch } from '../services/storage'

export async function foundationRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  // GET /foundations — listado público
  fastify.get<{ Querystring: { city?: string; country?: string; verified?: string } }>('/', async (request, reply) => {
    const { city, country, verified } = request.query
    const filter: Record<string, unknown> = {}
    if (city) filter.city = new RegExp(city, 'i')
    if (country) filter.country = country
    if (verified === 'true') filter.verified = true

    const foundations = await Foundation.find(filter).sort({ verified: -1, createdAt: -1 })
    return reply.send({ success: true, data: foundations })
  })

  // GET /foundations/:slug — perfil público
  fastify.get<{ Params: { slug: string } }>('/:slug', async (request, reply) => {
    const { slug } = request.params
    const foundation = await Foundation.findOne({ slug })
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

    const rawPets = await Pet.find({ foundationId: foundation._id, status: 'available' })
      .sort({ urgent: -1, createdAt: -1 })
      .limit(12)
      .lean()

    const signedArrays = await signPhotoUrlsBatch(rawPets.map((p) => p.photos ?? []))
    const pets = rawPets.map((pet, i) => ({ ...pet, photos: signedArrays[i] }))

    return reply.send({ success: true, data: { foundation, pets } })
  })

  // POST /foundations — registrar fundación
  fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId } = request.user
    const existing = await Foundation.findOne({ ownerId: userId })
    if (existing) {
      return reply.status(409).send({ success: false, error: 'Ya tienes una fundación registrada' })
    }

    const body = createFoundationSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const foundation = await Foundation.create({ ...body.data, ownerId: userId })
    await User.findByIdAndUpdate(userId, { role: 'foundation', foundationId: foundation._id })

    return reply.status(201).send({ success: true, data: foundation })
  })

  // PATCH /foundations/:id
  fastify.patch<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const { userId } = request.user

    const foundation = await Foundation.findById(id)
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })
    if (foundation.ownerId.toString() !== userId) {
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

// PATCH /foundations/:id/verify — solo Admin
export async function verifyFoundation(fastify: FastifyInstance) {
  const { authenticate } = fastify
  fastify.patch<{ Params: { id: string } }>('/:id/verify', { onRequest: [authenticate] }, async (request, reply) => {
    const { role } = request.user
    if (role !== 'admin') {
      return reply.status(403).send({ success: false, error: 'Solo admins pueden verificar fundaciones' })
    }
    const { id } = request.params
    const foundation = await Foundation.findByIdAndUpdate(id, { verified: true }, { new: true })
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })
    return reply.send({ success: true, data: foundation })
  })
}
