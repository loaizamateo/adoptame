import { FastifyInstance } from 'fastify'
import { uploadFile, getSignedFileUrl } from '../services/storage'

export async function uploadRoutes(fastify: FastifyInstance) {
  const { authenticate } = fastify

  fastify.post('/image', { onRequest: [authenticate] }, async (request, reply) => {
    const data = await request.file()
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
      const key = await uploadFile(buffer, data.mimetype, 'pets')
      const url = await getSignedFileUrl(key)
      return reply.send({ success: true, data: { key, url } })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir imagen'
      return reply.status(500).send({ success: false, error: message })
    }
  })
}
