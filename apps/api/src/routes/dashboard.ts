import { FastifyInstance } from 'fastify'
import { Pet } from '../models/Pet'
import { AdoptionRequest } from '../models/AdoptionRequest'
import { Foundation } from '../models/Foundation'

export async function dashboardRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

  // GET /dashboard/stats — métricas de la fundación
  fastify.get('/stats', { onRequest: [authenticate] }, async (request, reply) => {
    const user = (request as any).user
    if (user.role !== 'foundation') {
      return reply.status(403).send({ success: false, error: 'Solo fundaciones' })
    }

    const foundation = await Foundation.findOne({ ownerId: user.userId })
    if (!foundation) return reply.status(404).send({ success: false, error: 'Fundación no encontrada' })

    const fId = foundation._id

    const [
      totalPets,
      availablePets,
      inProcessPets,
      adoptedPets,
      urgentPets,
      totalRequests,
      pendingRequests,
      reviewingRequests,
    ] = await Promise.all([
      Pet.countDocuments({ foundationId: fId }),
      Pet.countDocuments({ foundationId: fId, status: 'available' }),
      Pet.countDocuments({ foundationId: fId, status: 'in_process' }),
      Pet.countDocuments({ foundationId: fId, status: 'adopted' }),
      Pet.countDocuments({ foundationId: fId, status: 'available', urgent: true }),
      AdoptionRequest.countDocuments({ foundationId: fId }),
      AdoptionRequest.countDocuments({ foundationId: fId, status: 'pending' }),
      AdoptionRequest.countDocuments({ foundationId: fId, status: 'reviewing' }),
    ])

    // Adopciones por mes (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const adoptionsByMonth = await AdoptionRequest.aggregate([
      {
        $match: {
          foundationId: fId,
          status: 'completed',
          updatedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return reply.send({
      success: true,
      data: {
        pets: { total: totalPets, available: availablePets, inProcess: inProcessPets, adopted: adoptedPets, urgent: urgentPets },
        requests: { total: totalRequests, pending: pendingRequests, reviewing: reviewingRequests },
        adoptionsByMonth,
        foundation,
      },
    })
  })
}
