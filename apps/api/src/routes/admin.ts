import { FastifyInstance } from 'fastify'
import { User } from '../models/User'
import { Foundation } from '../models/Foundation'
import { Pet } from '../models/Pet'
import { AdoptionRequest } from '../models/AdoptionRequest'
import { sendEmail, emailTemplates } from '../services/email'

export async function adminRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

  // Guard admin
  const adminOnly = async (request: any, reply: any) => {
    await authenticate(request, reply)
    if (request.user?.role !== 'admin') {
      return reply.status(403).send({ success: false, error: 'Solo administradores' })
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
  fastify.get('/foundations', { onRequest: [adminOnly] }, async (request, reply) => {
    const q = request.query as any
    const filter: any = {}
    if (q.verified !== undefined) filter.verified = q.verified === 'true'
    const foundations = await Foundation.find(filter)
      .populate('ownerId', 'name email createdAt')
      .sort({ createdAt: -1 })
    return reply.send({ success: true, data: foundations })
  })

  // PATCH /admin/foundations/:id/verify
  fastify.patch('/foundations/:id/verify', { onRequest: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const { verified } = request.body as { verified: boolean }

    const foundation = await Foundation.findByIdAndUpdate(id, { verified }, { new: true })
      .populate('ownerId', 'name email')
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

    // Notificar al dueño
    try {
      const owner = foundation.ownerId as any
      if (owner?.email && verified) {
        await sendEmail({
          to: owner.email,
          subject: '¡Tu fundación fue verificada en Adoptame! ✅',
          html: `<p>Hola ${owner.name}, tu fundación <strong>${foundation.name}</strong> fue verificada. Ya aparece con el badge oficial en Adoptame.</p>`,
        })
      }
    } catch (e) { request.log.error(e, 'email: error notificando verificación de fundación') }

    return reply.send({ success: true, data: foundation })
  })

  // GET /admin/users
  fastify.get('/users', { onRequest: [adminOnly] }, async (request, reply) => {
    const q = request.query as any
    const page = parseInt(q.page) || 1
    const limit = 20
    const filter: any = {}
    if (q.role) filter.role = q.role
    const [data, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      User.countDocuments(filter),
    ])
    return reply.send({ success: true, data: { data, total, page } })
  })

  // PATCH /admin/users/:id/toggle
  fastify.patch('/users/:id/toggle', { onRequest: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const user = await User.findById(id)
    if (!user) return reply.status(404).send({ success: false, error: 'Usuario no encontrado' })
    user.active = !user.active
    await user.save()
    return reply.send({ success: true, data: { active: user.active } })
  })

  // GET /admin/pets?status=available&page=1
  fastify.get('/pets', { onRequest: [adminOnly] }, async (request, reply) => {
    const q = request.query as any
    const page = parseInt(q.page) || 1
    const limit = 20
    const filter: any = {}
    if (q.status) filter.status = q.status
    const [data, total] = await Promise.all([
      Pet.find(filter)
        .populate('foundationId', 'name city verified')
        .sort({ createdAt: -1 })
        .skip((page-1)*limit).limit(limit),
      Pet.countDocuments(filter),
    ])
    return reply.send({ success: true, data: { data, total, page } })
  })
}
