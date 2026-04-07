import { sendEmail, emailTemplates } from '../services/email'
import { signPhotoUrls, signPhotoUrlsBatch } from '../services/storage'
import { FastifyInstance } from 'fastify'
import { createAdoptionRequestSchema } from '@adoptame/schemas'
import { AdoptionRequest, AdoptionStatus } from '../models/AdoptionRequest'
import { Pet } from '../models/Pet'
import { Foundation } from '../models/Foundation'

async function signAdoptionPhotos(adoptions: any[]): Promise<any[]> {
  const objs = adoptions.map((a) => (a.toObject ? a.toObject() : a))
  const photoKeys = objs.map((o) => o.petId?.photos ?? [])
  const signedArrays = await signPhotoUrlsBatch(photoKeys)
  return objs.map((obj, i) => {
    if (obj.petId && signedArrays[i].length) obj.petId.photos = signedArrays[i]
    return obj
  })
}

export async function adoptionRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  // POST /adoptions — crear solicitud (solo adoptantes)
  fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId, role } = request.user
    if (role === 'foundation' || role === 'admin') {
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

    const existing = await AdoptionRequest.findOne({
      petId: body.data.petId,
      userId,
      status: { $in: ['pending', 'reviewing'] },
    })
    if (existing) {
      return reply.status(409).send({ success: false, error: 'Ya tienes una solicitud activa para esta mascota' })
    }

    const adoption = await AdoptionRequest.create({
      ...body.data,
      userId,
      foundationId: pet.foundationId,
    })

    const foundation = await Foundation.findById(pet.foundationId)
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })
    try {
      const [foundationOwner, adopterUser] = await Promise.all([
        (await import('../models/User')).User.findById(foundation.ownerId).select('name email'),
        (await import('../models/User')).User.findById(userId).select('name'),
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
    } catch (e) { request.log.error(e, 'email: error notificando nueva solicitud') }

    return reply.status(201).send({ success: true, data: adoption })
  })

  // GET /adoptions/mine — solicitudes del adoptante
  fastify.get('/mine', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId } = request.user
    const rawAdoptions = await AdoptionRequest.find({ userId })
      .populate('petId', 'name photos species breed city')
      .populate('foundationId', 'name slug')
      .sort({ createdAt: -1 })
    const adoptions = await signAdoptionPhotos(rawAdoptions)
    return reply.send({ success: true, data: adoptions })
  })

  // GET /adoptions/foundation — solicitudes recibidas por la fundación
  fastify.get('/foundation', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId, role } = request.user
    if (role !== 'foundation') {
      return reply.status(403).send({ success: false, error: 'Solo fundaciones pueden ver sus solicitudes' })
    }

    const foundation = await Foundation.findOne({ ownerId: userId })
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

    const { status } = request.query as { status?: string }
    const filter: Record<string, unknown> = { foundationId: foundation._id }
    if (status) filter.status = status

    const rawAdoptions = await AdoptionRequest.find(filter)
      .populate('petId', 'name photos species breed city')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
    const adoptions = await signAdoptionPhotos(rawAdoptions)
    return reply.send({ success: true, data: adoptions })
  })

  // GET /adoptions/:id — detalle de una solicitud
  fastify.get<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const { userId, role } = request.user

    const adoption = await AdoptionRequest.findById(id)
      .populate('petId')
      .populate('userId', 'name email city country')
      .populate('foundationId', 'name slug')

    if (!adoption) return reply.status(404).send({ success: false, error: 'Solicitud no encontrada' })

    const foundation = await Foundation.findOne({ ownerId: userId })
    const isOwner = adoption.userId.toString() === userId
    const isFoundation = foundation && adoption.foundationId.toString() === foundation._id.toString()

    if (!isOwner && !isFoundation && role !== 'admin') {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    const adoptionObj = adoption.toObject() as unknown as Record<string, unknown>
    const petObj = adoptionObj.petId as Record<string, unknown> | null
    if (petObj && Array.isArray(petObj.photos) && petObj.photos.length) {
      petObj.photos = await signPhotoUrls(petObj.photos as string[])
    }
    return reply.send({ success: true, data: adoptionObj })
  })

  // PATCH /adoptions/:id/status — fundación actualiza estado
  fastify.patch<{ Params: { id: string }; Body: { status: string; notes?: string } }>(
    '/:id/status',
    { onRequest: [authenticate] },
    async (request, reply) => {
      const { id } = request.params
      const { userId } = request.user
      const { status, notes } = request.body

      const validStatuses: AdoptionStatus[] = ['reviewing', 'approved', 'rejected', 'completed']
      if (!validStatuses.includes(status as AdoptionStatus)) {
        return reply.status(400).send({ success: false, error: 'Estado inválido' })
      }

      const adoption = await AdoptionRequest.findById(id)
      if (!adoption) return reply.status(404).send({ success: false, error: 'Solicitud no encontrada' })

      const foundation = await Foundation.findOne({ ownerId: userId })
      if (!foundation || adoption.foundationId.toString() !== foundation._id.toString()) {
        return reply.status(403).send({ success: false, error: 'No autorizado' })
      }

      adoption.status = status as AdoptionStatus
      if (notes) adoption.notes = notes
      await adoption.save()

      try {
        const { User } = await import('../models/User')
        const adopter = await User.findById(adoption.userId).select('name email')
        if (adopter?.email) {
          const petDoc = await Pet.findById(adoption.petId).select('name')
          const tpl = emailTemplates.adoptionStatusChanged(adopter.name, petDoc?.name ?? 'tu mascota', status, notes)
          await sendEmail({ to: adopter.email, ...tpl })
        }
      } catch (e) { request.log.error(e, 'email: error notificando cambio de estado') }

      if (status === 'approved') {
        const pet = await Pet.findOneAndUpdate(
          { _id: adoption.petId, status: 'available' },
          { status: 'in_process' },
        )
        if (!pet) {
          return reply.status(409).send({
            success: false,
            error: 'Esta mascota ya fue aprobada para otra solicitud',
          })
        }
      }

      if (status === 'completed') {
        await Pet.findOneAndUpdate(
          { _id: adoption.petId, status: 'in_process' },
          { status: 'adopted' },
        )
      }

      if (status === 'rejected') {
        await Pet.findOneAndUpdate(
          { _id: adoption.petId, status: 'in_process' },
          { status: 'available' },
        )
      }

      return reply.send({ success: true, data: adoption })
    }
  )
}
