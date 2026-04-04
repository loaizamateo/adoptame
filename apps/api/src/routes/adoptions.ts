import { sendEmail, emailTemplates } from '../services/email'
import { signPhotoUrls } from '../services/storage'
import { FastifyInstance } from 'fastify'
import { createAdoptionRequestSchema } from '@adoptame/schemas'
import { AdoptionRequest } from '../models/AdoptionRequest'
import { Pet } from '../models/Pet'
import { Foundation } from '../models/Foundation'


async function signAdoptionPhotos(adoptions: any[]): Promise<any[]> {
  return Promise.all(adoptions.map(async (a) => {
    const obj = a.toObject ? a.toObject() : a
    if (obj.petId?.photos?.length) obj.petId.photos = await signPhotoUrls(obj.petId.photos)
    return obj
  }))
}

export async function adoptionRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

  // POST /adoptions — crear solicitud (solo adoptantes)
  fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    if (user.role === 'foundation' || user.role === 'admin') {
      return reply.status(403).send({ success: false, error: 'Solo adoptantes pueden solicitar adopciones' })
    }

    const body = createAdoptionRequestSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const pet = await Pet.findById(body.data.petId)
    if (!pet) return reply.status(404).send({ success: false, error: 'Mascota no encontrada' })
    if (pet.status !== 'available') {
      return reply.status(409).send({ success: false, error: 'Esta mascota ya no está disponible' })
    }

    // Verificar que no tenga solicitud pendiente para esta mascota
    const existing = await AdoptionRequest.findOne({
      petId: body.data.petId,
      userId: user.userId,
      status: { $in: ['pending', 'reviewing'] },
    })
    if (existing) {
      return reply.status(409).send({ success: false, error: 'Ya tienes una solicitud activa para esta mascota' })
    }

    const adoption = await AdoptionRequest.create({
      ...body.data,
      userId: user.userId,
      foundationId: pet.foundationId,
    })

    // Notificar a la fundación
    const foundation = await Foundation.findById(pet.foundationId)
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })
    try {
      const [foundationOwner, adopterUser] = await Promise.all([
        (await import('../models/User')).User.findById(foundation.ownerId).select('name email'),
        (await import('../models/User')).User.findById(user.userId).select('name'),
      ])
      if (foundationOwner?.email) {
        const tpl = emailTemplates.adoptionRequestReceived(
          foundation.name,
          pet.name,
          adopterUser?.name ?? 'Un adoptante',
          `${process.env.FRONTEND_URL}/dashboard/solicitudes`
        )
        await sendEmail({ to: foundationOwner.email, ...tpl })
      }
    } catch (e) { console.error('[email] adoption notify:', e) }

    return reply.status(201).send({ success: true, data: adoption })
  })

  // GET /adoptions/mine — solicitudes del adoptante
  fastify.get('/mine', { onRequest: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    const rawAdoptions = await AdoptionRequest.find({ userId: user.userId })
      .populate('petId', 'name photos species breed city')
      .populate('foundationId', 'name slug')
      .sort({ createdAt: -1 })
    const adoptions = await signAdoptionPhotos(rawAdoptions)
    return reply.send({ success: true, data: adoptions })
  })

  // GET /adoptions/foundation — solicitudes recibidas por la fundación
  fastify.get('/foundation', { onRequest: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    if (user.role !== 'foundation') {
      return reply.status(403).send({ success: false, error: 'Solo fundaciones pueden ver sus solicitudes' })
    }

    const foundation = await Foundation.findOne({ ownerId: user.userId })
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

    const query = request.query as any
    const filter: Record<string, any> = { foundationId: foundation._id }
    if (query.status) filter.status = query.status

    const rawAdoptions = await AdoptionRequest.find(filter)
      .populate('petId', 'name photos species breed city')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
    const adoptions = await signAdoptionPhotos(rawAdoptions)
    return reply.send({ success: true, data: adoptions })
  })

  // GET /adoptions/:id — detalle de una solicitud
  fastify.get('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params as any
    const user = (request as any).user

    const adoption = await AdoptionRequest.findById(id)
      .populate('petId')
      .populate('userId', 'name email city country')
      .populate('foundationId', 'name slug')

    if (!adoption) return reply.status(404).send({ success: false, error: 'Solicitud no encontrada' })

    // Solo el adoptante o la fundación pueden ver la solicitud
    const foundation = await Foundation.findOne({ ownerId: user.userId })
    const isOwner = adoption.userId.toString() === user.userId
    const isFoundation = foundation && adoption.foundationId.toString() === foundation._id.toString()

    if (!isOwner && !isFoundation && user.role !== 'admin') {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    const adoptionObj = adoption.toObject()
    if (adoptionObj.petId?.photos?.length) adoptionObj.petId.photos = await signPhotoUrls(adoptionObj.petId.photos)
    return reply.send({ success: true, data: adoptionObj })
  })

  // PATCH /adoptions/:id/status — fundación actualiza estado
  fastify.patch('/:id/status', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params as any
    const user = (request as any).user
    const { status, notes } = request.body as { status: string; notes?: string }

    const validStatuses = ['reviewing', 'approved', 'rejected', 'completed']
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ success: false, error: 'Estado inválido' })
    }

    const adoption = await AdoptionRequest.findById(id)
    if (!adoption) return reply.status(404).send({ success: false, error: 'Solicitud no encontrada' })

    const foundation = await Foundation.findOne({ ownerId: user.userId })
    if (!foundation || adoption.foundationId.toString() !== foundation._id.toString()) {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    adoption.status = status as any
    if (notes) adoption.notes = notes
    await adoption.save()

    // Notificar al adoptante
    try {
      const { User } = await import('../models/User')
      const adopter = await User.findById(adoption.userId).select('name email')
      if (adopter?.email) {
        const petDoc = await Pet.findById(adoption.petId).select('name')
        const tpl = emailTemplates.adoptionStatusChanged(adopter.name, petDoc?.name ?? 'tu mascota', status, notes)
        await sendEmail({ to: adopter.email, ...tpl })
      }
    } catch (e) { console.error('[email] status notify:', e) }

    // Si se aprueba, poner la mascota en "en proceso"
    if (status === 'approved') {
      await Pet.findByIdAndUpdate(adoption.petId, { status: 'in_process' })
    }

    // Si se completa, marcar mascota como adoptada
    if (status === 'completed') {
      await Pet.findByIdAndUpdate(adoption.petId, { status: 'adopted' })
    }

    // Si se rechaza y estaba en proceso, volver a disponible
    if (status === 'rejected') {
      const pet = await Pet.findById(adoption.petId)
      if (pet?.status === 'in_process') {
        await Pet.findByIdAndUpdate(adoption.petId, { status: 'available' })
      }
    }

    return reply.send({ success: true, data: adoption })
  })
}
