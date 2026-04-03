import { FastifyInstance } from 'fastify'
import { FosterHome } from '../models/FosterHome'

export async function fosterHomeRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

  // GET /foster-homes — listado público con filtros
  fastify.get('/', async (request, reply) => {
    const { city, species, size, status = 'available', page = '1', limit = '12' } = request.query as any
    const filter: any = {}
    if (status) filter.status = status
    if (city) filter.city = { $regex: city, $options: 'i' }
    if (species) filter.acceptedSpecies = species
    if (size) filter.acceptedSizes = size

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [homes, total] = await Promise.all([
      FosterHome.find(filter)
        .populate('userId', 'name avatar city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FosterHome.countDocuments(filter),
    ])

    return { homes, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } }
  })

  // GET /foster-homes/mine — hogar del usuario autenticado
  fastify.get('/mine', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    const home = await FosterHome.findOne({ userId: user.id })
    if (!home) return reply.code(404).send({ message: 'No tenés un hogar de paso registrado' })
    return home
  })

  // GET /foster-homes/:id — detalle
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const home = await FosterHome.findById(id).populate('userId', 'name avatar city')
    if (!home) return reply.code(404).send({ message: 'Hogar no encontrado' })
    return home
  })

  // POST /foster-homes — registrarse como hogar de paso
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    const existing = await FosterHome.findOne({ userId: user.id })
    if (existing) return reply.code(400).send({ message: 'Ya tenés un hogar de paso registrado' })
    const body = request.body as any
    const home = await FosterHome.create({ ...body, userId: user.id })
    return reply.code(201).send(home)
  })

  // PATCH /foster-homes/:id — editar (solo owner o admin)
  fastify.patch('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    const { id } = request.params as any
    const home = await FosterHome.findById(id)
    if (!home) return reply.code(404).send({ message: 'Hogar no encontrado' })
    if (home.userId.toString() !== user.id && user.role !== 'admin')
      return reply.code(403).send({ message: 'No autorizado' })

    const allowed = ['name','bio','city','country','phone','acceptedSpecies','acceptedSizes','capacity','acceptsKids','acceptsPets','status','experience','photos']
    const body = request.body as any
    allowed.forEach(k => { if (body[k] !== undefined) (home as any)[k] = body[k] })
    await home.save()
    return home
  })

  // DELETE /foster-homes/:id — eliminar (solo owner o admin)
  fastify.delete('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    const { id } = request.params as any
    const home = await FosterHome.findById(id)
    if (!home) return reply.code(404).send({ message: 'Hogar no encontrado' })
    if (home.userId.toString() !== user.id && user.role !== 'admin')
      return reply.code(403).send({ message: 'No autorizado' })
    await home.deleteOne()
    return { message: 'Hogar eliminado' }
  })
}
