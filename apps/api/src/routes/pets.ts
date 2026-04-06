import { FastifyInstance } from 'fastify'
import { signPhotoUrls } from '../services/storage'
import { createPetSchema, updatePetSchema } from '@adoptame/schemas'
import { Pet } from '../models/Pet'
import { Foundation } from '../models/Foundation'

/** Escape special regex chars to prevent ReDoS from user-supplied strings */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface PetListQuery {
  species?: string
  size?: string
  age?: string
  sex?: string
  city?: string
  country?: string
  compatibleWithKids?: string
  compatibleWithPets?: string
  urgent?: string
  search?: string
  page?: string
  limit?: string
  status?: string
}

export async function petRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  // GET /pets — búsqueda pública con filtros
  fastify.get<{ Querystring: PetListQuery }>('/', async (request, reply) => {
    const query = request.query
    const filter: Record<string, unknown> = { status: 'available' }

    if (query.species) filter.species = query.species
    if (query.size) filter.size = query.size
    if (query.age) filter.age = query.age
    if (query.sex) filter.sex = query.sex
    if (query.city) filter.city = { $regex: escapeRegex(query.city), $options: 'i' }
    if (query.country) filter.country = query.country
    if (query.compatibleWithKids === 'true') filter.compatibleWithKids = true
    if (query.compatibleWithPets === 'true') filter.compatibleWithPets = true
    if (query.urgent === 'true') filter.urgent = true
    if (query.search) filter.$text = { $search: query.search }

    const page = parseInt(query.page ?? '1') || 1
    const limit = Math.min(parseInt(query.limit ?? '12') || 12, 48)
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Pet.find(filter)
        .populate('foundationId', 'name logo city country verified')
        .sort({ urgent: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Pet.countDocuments(filter),
    ])

    const signedData = await Promise.all(
      data.map(async (pet) => {
        const obj = pet.toObject()
        if (obj.photos?.length) obj.photos = await signPhotoUrls(obj.photos)
        return obj
      })
    )

    return reply.send({
      success: true,
      data: { data: signedData, total, page, totalPages: Math.ceil(total / limit) },
    })
  })

  // GET /pets/:id — detalle público
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params
    const pet = await Pet.findById(id).populate('foundationId', 'name logo city country verified description instagram facebook website')
    if (!pet) return reply.status(404).send({ success: false, error: 'Mascota no encontrada' })
    const petObj = pet.toObject()
    if (petObj.photos?.length) petObj.photos = await signPhotoUrls(petObj.photos)
    return reply.send({ success: true, data: petObj })
  })

  // GET /pets/mine — mascotas de la fundación autenticada
  fastify.get<{ Querystring: PetListQuery }>('/mine', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId } = request.user
    const foundation = await Foundation.findOne({ ownerId: userId })
    if (!foundation) {
      return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })
    }

    const query = request.query
    const filter: Record<string, unknown> = { foundationId: foundation._id }
    if (query.status) filter.status = query.status
    const page = parseInt(query.page ?? '1') || 1
    const limit = Math.min(parseInt(query.limit ?? '24') || 24, 48)
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Pet.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Pet.countDocuments(filter),
    ])

    const signedData = await Promise.all(
      data.map(async (pet) => {
        const obj = pet.toObject()
        if (obj.photos?.length) obj.photos = await signPhotoUrls(obj.photos)
        return obj
      })
    )

    return reply.send({
      success: true,
      data: { data: signedData, total, page, totalPages: Math.ceil(total / limit) },
    })
  })

  // POST /pets — crear (solo fundación)
  fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
    const { userId, role } = request.user
    if (role !== 'foundation') {
      return reply.status(403).send({ success: false, error: 'Solo fundaciones pueden publicar mascotas' })
    }

    const body = createPetSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    const foundation = await Foundation.findOne({ ownerId: userId })
    if (!foundation) {
      return reply.status(400).send({ success: false, error: 'No tienes una fundación registrada' })
    }

    const pet = await Pet.create({ ...body.data, foundationId: foundation._id })
    return reply.status(201).send({ success: true, data: pet })
  })

  // PATCH /pets/:id
  fastify.patch<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const { userId } = request.user

    const pet = await Pet.findById(id)
    if (!pet) return reply.status(404).send({ success: false, error: 'Mascota no encontrada' })

    const foundation = await Foundation.findOne({ ownerId: userId })
    if (!foundation || pet.foundationId.toString() !== foundation._id.toString()) {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    const body = updatePetSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() })
    }

    Object.assign(pet, body.data)
    await pet.save()

    return reply.send({ success: true, data: pet })
  })

  // DELETE /pets/:id
  fastify.delete<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const { userId } = request.user

    const pet = await Pet.findById(id)
    if (!pet) return reply.status(404).send({ success: false, error: 'Mascota no encontrada' })

    const foundation = await Foundation.findOne({ ownerId: userId })
    if (!foundation || pet.foundationId.toString() !== foundation._id.toString()) {
      return reply.status(403).send({ success: false, error: 'No autorizado' })
    }

    await pet.deleteOne()
    return reply.send({ success: true, message: 'Mascota eliminada' })
  })
}
