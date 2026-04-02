/**
 * 🌱 Adoptame — Seed Script
 *
 * Pobla la base de datos con datos de prueba para desarrollo local.
 *
 * Uso:
 *   cd apps/api && npm run seed
 *
 * Qué crea:
 *   - 1 admin, 2 fundaciones, 1 adoptante
 *   - 2 fundaciones verificadas (Bogotá + Medellín)
 *   - 10 mascotas variadas con fotos reales
 *   - 3 solicitudes de adopción en distintos estados
 *
 * Credenciales de prueba:
 *   admin@adoptame.app       / Admin1234!
 *   fundacion1@adoptame.app  / Fund1234!
 *   fundacion2@adoptame.app  / Fund1234!
 *   adoptante@adoptame.app   / User1234!
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import slugify from 'slugify'
import { USERS_DATA, FOUNDATIONS_DATA, PETS_DATA, ADOPTION_REQUESTS_DATA } from './data'

// Carga .env manualmente
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../.env') })

async function seed() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    console.error('❌ MONGODB_URI no está definido en .env')
    process.exit(1)
  }

  console.log('🔌 Conectando a MongoDB...')
  await mongoose.connect(mongoUri)
  console.log('✅ Conectado\n')

  // Importar modelos dinámicamente después de conectar
  const { User } = await import('../models/User')
  const { Foundation } = await import('../models/Foundation')
  const { Pet } = await import('../models/Pet')
  const { AdoptionRequest } = await import('../models/AdoptionRequest')

  // Limpiar colecciones existentes
  console.log('🧹 Limpiando datos anteriores...')
  await Promise.all([
    User.deleteMany({}),
    Foundation.deleteMany({}),
    Pet.deleteMany({}),
    AdoptionRequest.deleteMany({}),
  ])
  console.log('✅ Base de datos limpia\n')

  // ── Usuarios ────────────────────────────────────────────────
  console.log('👤 Creando usuarios...')
  const userMap: Record<string, any> = {}

  for (const u of USERS_DATA) {
    const user = await User.create({ ...u })
    userMap[u.email] = user
    console.log(`   ✓ ${u.role.padEnd(12)} ${u.email}`)
  }

  // ── Fundaciones ──────────────────────────────────────────────
  console.log('\n🏠 Creando fundaciones...')
  const foundationMap: Record<string, any> = {}

  for (const f of FOUNDATIONS_DATA) {
    const owner = userMap[f.userEmail]
    const slug = slugify(f.name, { lower: true, strict: true })
    const { userEmail, ...rest } = f
    const foundation = await Foundation.create({ ...rest, slug, ownerId: owner._id })
    foundationMap[f.userEmail] = foundation
    // Vincular usuario con fundación
    await User.findByIdAndUpdate(owner._id, { foundationId: foundation._id })
    console.log(`   ✓ ${foundation.name} (${foundation.city})`)
  }

  // ── Mascotas ─────────────────────────────────────────────────
  console.log('\n🐾 Creando mascotas...')
  const petMap: Record<string, any> = {}

  for (const p of PETS_DATA) {
    const foundation = foundationMap[p.foundationEmail]
    const { foundationEmail, ...rest } = p
    const pet = await Pet.create({ ...rest, foundationId: foundation._id })
    petMap[pet.name] = pet
    console.log(`   ✓ ${pet.name.padEnd(10)} ${pet.species === 'dog' ? '🐶' : '🐱'} ${pet.city}${pet.urgent ? ' 🚨' : ''}`)
  }

  // ── Solicitudes de adopción ───────────────────────────────────
  console.log('\n📋 Creando solicitudes de adopción...')

  for (const r of ADOPTION_REQUESTS_DATA) {
    const adopter = userMap[r.adopterEmail]
    const pet = petMap[r.petName]
    if (!pet) { console.warn(`   ⚠ Mascota "${r.petName}" no encontrada, saltando`); continue }
    const foundation = await Foundation.findById(pet.foundationId)
    const { adopterEmail, petName, ...rest } = r
    await AdoptionRequest.create({
      ...rest,
      petId: pet._id,
      userId: adopter._id,
      foundationId: foundation!._id,
    })
    console.log(`   ✓ ${r.adopterEmail} → ${r.petName} [${r.status}]`)
  }

  // ── Resumen ───────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('🌱 Seed completado exitosamente!\n')
  console.log('📋 Credenciales de acceso:')
  console.log('   Admin:       admin@adoptame.app       / Admin1234!')
  console.log('   Fundación 1: fundacion1@adoptame.app  / Fund1234!')
  console.log('   Fundación 2: fundacion2@adoptame.app  / Fund1234!')
  console.log('   Adoptante:   adoptante@adoptame.app   / User1234!')
  console.log('\n🚀 Levanta el proyecto con: npm run dev')
  console.log('─'.repeat(50))

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
