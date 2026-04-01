import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { env } from './config/env'
import { connectDatabase } from './config/database'
import { authRoutes } from './routes/auth'
import { petRoutes } from './routes/pets'
import { foundationRoutes } from './routes/foundations'

const fastify = Fastify({
  logger: env.NODE_ENV === 'development',
})

async function bootstrap() {
  // Plugins de seguridad
  await fastify.register(helmet)
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  })
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // JWT
  await fastify.register(import('./plugins/jwt'))

  // Rutas
  fastify.register(authRoutes, { prefix: '/api/v1/auth' })
  fastify.register(petRoutes, { prefix: '/api/v1/pets' })
  fastify.register(foundationRoutes, { prefix: '/api/v1/foundations' })

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Conectar DB
  await connectDatabase()

  // Iniciar servidor
  const port = parseInt(env.PORT)
  await fastify.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 API corriendo en http://localhost:${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
