import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { env } from '../config/env'

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ success: false, error: 'No autorizado' })
    }
  })
})
