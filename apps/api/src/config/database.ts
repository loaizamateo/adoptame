import mongoose from 'mongoose'
import { env } from './env'
import { logger } from './logger'

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI)
    logger.info('MongoDB conectado')
  } catch (error) {
    logger.error(error, 'Error conectando MongoDB')
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB desconectado')
})
