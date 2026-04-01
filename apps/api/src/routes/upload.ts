import { FastifyInstance } from 'fastify'
import { uploadFile } from '../services/storage'

export async function uploadRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

  // POST /upload/image — subir imagen (requiere auth)
  fastify.post('/image', { onRequest: [authenticate] }, async (request, reply) => {
    const data = await (request as any).file()
    if (!data) {
      return reply.status(400).send({ success: false, error: 'No se recibió ningún archivo' })
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(data.mimetype)) {
      return reply.status(400).send({ success: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' })
    }

    const buffer = await data.toBuffer()
    if (buffer.length > 5 * 1024 * 1024) {
      return reply.status(400).send({ success: false, error: 'La imagen no puede superar 5MB' })
    }

    try {
      const url = await uploadFile(buffer, data.mimetype, 'pets')
      return reply.send({ success: true, data: { url } })
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message })
    }
  })
}
