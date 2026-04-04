import { FastifyInstance } from 'fastify'
import { Pet } from '../models/Pet'
import { Foundation } from '../models/Foundation'
import { signPhotoUrls } from '../services/storage'

export async function searchRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const { q } = request.query as { q?: string }

    if (!q || q.trim().length < 2) {
      return { pets: [], foundations: [] }
    }

    const regex = new RegExp(q.trim(), 'i')

    const [rawPets, foundations] = await Promise.all([
      Pet.find({
        status: 'available',
        $or: [
          { name: regex },
          { breed: regex },
          { city: regex },
          { description: regex },
        ],
      })
        .select('name species breed city photos _id')
        .limit(5)
        .lean(),

      Foundation.find({
        $or: [
          { name: regex },
          { city: regex },
          { description: regex },
        ],
      })
        .select('name slug city logo verified _id')
        .limit(5)
        .lean(),
    ])

    // Firmar URLs de fotos de mascotas
    const pets = await Promise.all(
      rawPets.map(async (pet: any) => {
        if (pet.photos?.length) pet.photos = await signPhotoUrls(pet.photos)
        return pet
      })
    )

    return { pets, foundations }
  })
}
