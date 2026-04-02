import { FastifyInstance } from 'fastify'
import { uploadFile, getSignedFileUrl } from '../services/storage'

export async function uploadRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate

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
      // Sube y obtiene el key
      const key = await uploadFile(buffer, data.mimetype, 'pets')
      // Genera pre-signed URL para uso inmediato en el frontend
      const url = await getSignedFileUrl(key)
      // Devuelve tanto el key (para guardar en DB) como la URL firmada (para preview)
      return reply.send({ success: true, data: { key, url } })
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message })
    }
  })
}
