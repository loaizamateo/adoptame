import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { env } from './config/env'
import { connectDatabase } from './config/database'
import { authRoutes } from './routes/auth'
import { petRoutes } from './routes/pets'
import { foundationRoutes } from './routes/foundations'
import { uploadRoutes } from './routes/upload'
import { adoptionRoutes } from './routes/adoptions'
import { dashboardRoutes } from './routes/dashboard'

const fastify = Fastify({ logger: env.NODE_ENV === 'development' })

async function bootstrap() {
  await fastify.register(helmet)
  await fastify.register(cors, { origin: env.FRONTEND_URL, credentials: true })
  await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await fastify.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })
  await fastify.register(import('./plugins/jwt'))

  fastify.register(authRoutes,      { prefix: '/api/v1/auth' })
  fastify.register(petRoutes,       { prefix: '/api/v1/pets' })
  fastify.register(foundationRoutes,{ prefix: '/api/v1/foundations' })
  fastify.register(uploadRoutes,    { prefix: '/api/v1/upload' })
  fastify.register(adoptionRoutes,  { prefix: '/api/v1/adoptions' })
  fastify.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await connectDatabase()
  const port = parseInt(env.PORT)
  await fastify.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 API corriendo en http://localhost:${port}`)
}

bootstrap().catch((err) => { console.error(err); process.exit(1) })
