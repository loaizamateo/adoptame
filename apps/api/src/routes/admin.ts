import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models/User'
import { Foundation } from '../models/Foundation'
import { Pet } from '../models/Pet'
import { AdoptionRequest } from '../models/AdoptionRequest'
import { sendEmail } from '../services/email'

interface PaginationQuery { page?: string }
interface FilterQuery extends PaginationQuery { role?: string; verified?: string; status?: string }

export async function adminRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  const adminOnly = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await (authenticate as (req: FastifyRequest, rep: FastifyReply, done: () => void) => Promise<void>)(request, reply, () => {})
    if (request.user?.role !== 'admin') {
      reply.status(403).send({ success: false, error: 'Solo administradores' })
    }
  }

  // GET /admin/stats
  fastify.get('/stats', { onRequest: [adminOnly] }, async (_req, reply) => {
    const [users, foundations, pets, adoptions] = await Promise.all([
      User.countDocuments(),
      Foundation.countDocuments(),
      Pet.countDocuments(),
      AdoptionRequest.countDocuments(),
    ])
    const verified = await Foundation.countDocuments({ verified: true })
    const pending  = await Foundation.countDocuments({ verified: false })
    const adopted  = await AdoptionRequest.countDocuments({ status: 'completed' })
    return reply.send({ success: true, data: { users, foundations, verified, pending, pets, adoptions, adopted } })
  })

  // GET /admin/foundations?verified=false
  fastify.get<{ Querystring: FilterQuery }>('/foundations', { onRequest: [adminOnly] }, async (request, reply) => {
    const { verified } = request.query
    const filter: Record<string, unknown> = {}
    if (verified !== undefined) filter.verified = verified === 'true'
    const foundations = await Foundation.find(filter)
      .populate('ownerId', 'name email createdAt')
      .sort({ createdAt: -1 })
    return reply.send({ success: true, data: foundations })
  })

  // PATCH /admin/foundations/:id/verify
  fastify.patch<{ Params: { id: string }; Body: { verified: boolean } }>(
    '/foundations/:id/verify',
    { onRequest: [adminOnly] },
    async (request, reply) => {
      const { id } = request.params
      const { verified } = request.body

      const foundation = await Foundation.findByIdAndUpdate(id, { verified }, { new: true })
        .populate<{ ownerId: { name: string; email: string } }>('ownerId', 'name email')
      if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

      try {
        const owner = foundation.ownerId
        if (owner?.email && verified) {
          await sendEmail({
            to: owner.email,
            subject: '¡Tu fundación fue verificada en Adoptame! ✅',
            html: `<p>Hola ${owner.name}, tu fundación <strong>${foundation.name}</strong> fue verificada. Ya aparece con el badge oficial en Adoptame.</p>`,
          })
        }
      } catch (e) { request.log.error(e, 'email: error notificando verificación de fundación') }

      return reply.send({ success: true, data: foundation })
    }
  )

  // GET /admin/users
  fastify.get<{ Querystring: FilterQuery }>('/users', { onRequest: [adminOnly] }, async (request, reply) => {
    const { page, role } = request.query
    const pageNum = parseInt(page ?? '1') || 1
    const limit = 20
    const filter: Record<string, unknown> = {}
    if (role) filter.role = role
    const [data, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((pageNum - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ])
    return reply.send({ success: true, data: { data, total, page: pageNum } })
  })

  // PATCH /admin/users/:id/toggle
  fastify.patch<{ Params: { id: string } }>('/users/:id/toggle', { onRequest: [adminOnly] }, async (request, reply) => {
    const { id } = request.params
    const user = await User.findById(id)
    if (!user) return reply.status(404).send({ success: false, error: 'Usuario no encontrado' })
    user.active = !user.active
    await user.save()
    return reply.send({ success: true, data: { active: user.active } })
  })

  // GET /admin/pets?status=available&page=1
  fastify.get<{ Querystring: FilterQuery }>('/pets', { onRequest: [adminOnly] }, async (request, reply) => {
    const { page, status } = request.query
    const pageNum = parseInt(page ?? '1') || 1
    const limit = 20
    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    const [data, total] = await Promise.all([
      Pet.find(filter)
        .populate('foundationId', 'name city verified')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limit).limit(limit),
      Pet.countDocuments(filter),
    ])
    return reply.send({ success: true, data: { data, total, page: pageNum } })
  })
}
