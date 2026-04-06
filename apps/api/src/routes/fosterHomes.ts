import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { FosterHome } from '../models/FosterHome'

const fosterHomeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  bio: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().min(1, 'El país es requerido'),
  phone: z.string().optional(),
  acceptedSpecies: z.array(z.enum(['dog', 'cat', 'other'])).min(1),
  acceptedSizes: z.array(z.enum(['small', 'medium', 'large'])).min(1),
  capacity: z.number().int().min(1).max(10).default(1),
  acceptsKids: z.boolean().default(false),
  acceptsPets: z.boolean().default(false),
  experience: z.string().optional(),
  photos: z.array(z.string()).optional(),
})

const updateFosterHomeSchema = fosterHomeSchema.partial()

interface FosterHomeQuery {
  city?: string
  species?: string
  size?: string
  status?: string
  page?: string
  limit?: string
}

/** Escape special regex chars to prevent ReDoS from user-supplied strings */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function fosterHomeRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  // GET /foster-homes — listado público con filtros
  fastify.get<{ Querystring: FosterHomeQuery }>('/', async (request, reply) => {
    const { city, species, size, status = 'available', page = '1', limit = '12' } = request.query
    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (city) filter.city = { $regex: escapeRegex(city), $options: 'i' }
    if (species) filter.acceptedSpecies = species
    if (size) filter.acceptedSizes = size

    const pageNum = Math.max(parseInt(page) || 1, 1)
    const limitNum = Math.min(parseInt(limit) || 12, 48)
    const skip = (pageNum - 1) * limitNum

    const [homes, total] = await Promise.all([
      FosterHome.find(filter)
        .populate('userId', 'name avatar city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      FosterHome.countDocuments(filter),
    ])

    return reply.send({
      success: true,
      data: { data: homes, total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    })
  })

  // GET /foster-homes/mine — hogar del usuario autenticado
  fastify.get('/mine', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId } = request.user
    const home = await FosterHome.findOne({ userId })
    if (!home) return reply.status(404).send({ success: false, error: 'No tenés un hogar de paso registrado' })
    return reply.send({ success: true, data: home })
  })

  // GET /foster-homes/:id — detalle
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params
    const home = await FosterHome.findById(id).populate('userId', 'name avatar city')
    if (!home) return reply.status(404).send({ success: false, error: 'Hogar no encontrado' })
    return reply.send({ success: true, data: home })
  })

  // POST /foster-homes — registrarse como hogar de paso
  fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId } = request.user
    const existing = await FosterHome.findOne({ userId })
    if (existing) return reply.status(409).send({ success: false, error: 'Ya tenés un hogar de paso registrado' })

    const body = fosterHomeSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const home = await FosterHome.create({ ...body.data, userId })
    return reply.status(201).send({ success: true, data: home })
  })

  // PATCH /foster-homes/:id — editar (solo owner o admin)
  fastify.patch<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId, role } = request.user
    const { id } = request.params
    const home = await FosterHome.findById(id)
    if (!home) return reply.status(404).send({ success: false, error: 'Hogar no encontrado' })
    if (home.userId.toString() !== userId && role !== 'admin') {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    const body = updateFosterHomeSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    Object.assign(home, body.data)
    await home.save()
    return reply.send({ success: true, data: home })
  })

  // DELETE /foster-homes/:id — eliminar (solo owner o admin)
  fastify.delete<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId, role } = request.user
    const { id } = request.params
    const home = await FosterHome.findById(id)
    if (!home) return reply.status(404).send({ success: false, error: 'Hogar no encontrado' })
    if (home.userId.toString() !== userId && role !== 'admin') {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }
    await home.deleteOne()
    return reply.send({ success: true, message: 'Hogar eliminado' })
  })
}
