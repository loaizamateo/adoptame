import Fastify, { FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'

const JWT_SECRET = process.env.JWT_SECRET!

/** Build a Fastify app with JWT for route testing (no DB required — models are mocked) */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  await app.register(fastifyJwt, { secret: JWT_SECRET })

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ success: false, error: 'No autorizado' })
    }
  })

  const { authRoutes } = await import('../routes/auth')
  const { petRoutes } = await import('../routes/pets')
  const { adoptionRoutes } = await import('../routes/adoptions')

  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(petRoutes, { prefix: '/api/v1/pets' })
  app.register(adoptionRoutes, { prefix: '/api/v1/adoptions' })

  await app.ready()
  return app
}

/** Sign a JWT access token for test requests */
export function signToken(
  app: FastifyInstance,
  payload: { userId: string; role: string }
): string {
  return app.jwt.sign(payload, { expiresIn: '1h' })
}

/**
 * Returns a thenable query stub that also supports Mongoose-style chaining
 * (populate, sort, skip, limit, select). The chain always resolves to `value`.
 */
export function mockChain(value: any) {
  const q: any = {}
  const promise = Promise.resolve(value)
  q.then = promise.then.bind(promise)
  q.catch = promise.catch.bind(promise)
  q.finally = promise.finally.bind(promise)
  q.populate = jest.fn(() => q)
  q.sort = jest.fn(() => q)
  q.skip = jest.fn(() => q)
  q.limit = jest.fn(() => q)
  q.lean = jest.fn(() => q)
  q.select = jest.fn(() => Promise.resolve(value))
  return q
}

/** Shorthand for a chainable query that resolves to null */
export const nullQuery = () => mockChain(null)
