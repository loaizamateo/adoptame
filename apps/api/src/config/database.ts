import mongoose from 'mongoose'
import { env } from './env'

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log('✅ MongoDB conectado')
  } catch (error) {
    console.error('❌ Error conectando MongoDB:', error)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado')
})
