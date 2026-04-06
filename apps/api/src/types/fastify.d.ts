import 'fastify'
import { preHandlerHookHandler } from 'fastify'

export interface JwtPayload {
  userId: string
  role?: 'adopter' | 'foundation' | 'admin'
  type?: 'refresh'
  tokenVersion?: number
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: preHandlerHookHandler
  }

  interface FastifyRequest {
    user: JwtPayload
    file(): Promise<import('@fastify/multipart').MultipartFile | undefined>
  }
}
