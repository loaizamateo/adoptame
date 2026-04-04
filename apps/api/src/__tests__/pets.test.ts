import supertest from 'supertest'
import mongoose from 'mongoose'
import { buildApp, signToken, mockChain, nullQuery } from './helpers'
import { FastifyInstance } from 'fastify'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('../models/Pet', () => ({
  Pet: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
  },
}))

jest.mock('../models/Foundation', () => ({
  Foundation: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}))

jest.mock('../services/storage', () => ({
  signPhotoUrls: jest.fn((photos: string[]) => Promise.resolve(photos)),
  uploadFile: jest.fn(),
  getSignedFileUrl: jest.fn((k: string) => Promise.resolve(k)),
  deleteFile: jest.fn(),
}))

import { Pet } from '../models/Pet'
import { Foundation } from '../models/Foundation'

const MockPet = Pet as jest.Mocked<typeof Pet>
const MockFoundation = Foundation as jest.Mocked<typeof Foundation>

// ─── Fixtures ────────────────────────────────────────────────────────────────

const foundationId = new mongoose.Types.ObjectId()
const foundationUserId = new mongoose.Types.ObjectId()
const adopterUserId = new mongoose.Types.ObjectId()

function makeFoundation(overrides: Record<string, any> = {}) {
  return { _id: foundationId, name: 'Huellas Felices', ownerId: foundationUserId, ...overrides }
}

function makePet(overrides: Record<string, any> = {}) {
  const pet: any = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Luna',
    species: 'dog',
    age: 'young',
    size: 'medium',
    sex: 'female',
    description: 'Perrita muy cariñosa',
    city: 'Bogotá',
    country: 'Colombia',
    foundationId,
    status: 'available',
    photos: [],
    ...overrides,
  }
  pet.toObject = jest.fn(() => ({ ...pet }))
  pet.deleteOne = jest.fn().mockResolvedValue(undefined)
  pet.save = jest.fn().mockResolvedValue(pet)
  return pet
}

let app: FastifyInstance
let foundationToken: string
let adopterToken: string

beforeAll(async () => {
  app = await buildApp()
  foundationToken = signToken(app, { userId: foundationUserId.toString(), role: 'foundation' })
  adopterToken = signToken(app, { userId: adopterUserId.toString(), role: 'adopter' })
})

afterAll(async () => { await app.close() })
beforeEach(() => jest.clearAllMocks())

// ─── GET /pets ────────────────────────────────────────────────────────────────

describe('GET /api/v1/pets', () => {
  it('returns available pets with pagination metadata', async () => {
    const pets = [makePet(), makePet({ name: 'Thor' })]
    ;(MockPet.find as jest.Mock).mockReturnValue(mockChain(pets))
    ;(MockPet.countDocuments as jest.Mock).mockResolvedValue(2)

    const res = await supertest(app.server).get('/api/v1/pets')
    expect(res.status).toBe(200)
    expect(res.body.data.total).toBe(2)
    expect(res.body.data.data).toHaveLength(2)
    expect(res.body.data.page).toBe(1)
  })

  it('returns empty list when no pets exist', async () => {
    ;(MockPet.find as jest.Mock).mockReturnValue(mockChain([]))
    ;(MockPet.countDocuments as jest.Mock).mockResolvedValue(0)

    const res = await supertest(app.server).get('/api/v1/pets')
    expect(res.status).toBe(200)
    expect(res.body.data.data).toHaveLength(0)
    expect(res.body.data.total).toBe(0)
  })

  it('respects page and limit query params', async () => {
    ;(MockPet.find as jest.Mock).mockReturnValue(mockChain([makePet()]))
    ;(MockPet.countDocuments as jest.Mock).mockResolvedValue(10)

    const res = await supertest(app.server).get('/api/v1/pets?page=2&limit=3')
    expect(res.status).toBe(200)
    expect(res.body.data.page).toBe(2)
    expect(res.body.data.totalPages).toBe(4) // ceil(10/3)
  })
})

// ─── GET /pets/:id ────────────────────────────────────────────────────────────

describe('GET /api/v1/pets/:id', () => {
  it('returns a pet by id', async () => {
    const pet = makePet()
    ;(MockPet.findById as jest.Mock).mockReturnValue(mockChain(pet))

    const res = await supertest(app.server).get(`/api/v1/pets/${pet._id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Luna')
  })

  it('returns 404 for unknown id', async () => {
    ;(MockPet.findById as jest.Mock).mockReturnValue(mockChain(null))

    const res = await supertest(app.server)
      .get(`/api/v1/pets/${new mongoose.Types.ObjectId()}`)
    expect(res.status).toBe(404)
  })
})

// ─── POST /pets ───────────────────────────────────────────────────────────────

describe('POST /api/v1/pets', () => {
  const petPayload = {
    name: 'Luna',
    species: 'dog',
    age: 'young',
    size: 'medium',
    sex: 'female',
    description: 'Una perrita muy cariñosa y activa',
    city: 'Bogotá',
    country: 'Colombia',
  }

  it('creates a pet when called by a foundation user', async () => {
    const pet = makePet()
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())
    ;(MockPet.create as jest.Mock).mockResolvedValue(pet)

    const res = await supertest(app.server)
      .post('/api/v1/pets')
      .set('Authorization', `Bearer ${foundationToken}`)
      .send(petPayload)

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('Luna')
  })

  it('returns 403 when called by an adopter', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/pets')
      .set('Authorization', `Bearer ${adopterToken}`)
      .send(petPayload)
    expect(res.status).toBe(403)
  })

  it('returns 401 without a token', async () => {
    const res = await supertest(app.server).post('/api/v1/pets').send(petPayload)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid pet data', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/pets')
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ name: '', species: 'alien' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when foundation has no foundation record', async () => {
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .post('/api/v1/pets')
      .set('Authorization', `Bearer ${foundationToken}`)
      .send(petPayload)
    expect(res.status).toBe(400)
  })
})

// ─── PATCH /pets/:id ─────────────────────────────────────────────────────────

describe('PATCH /api/v1/pets/:id', () => {
  it('updates a pet owned by the foundation', async () => {
    const pet = makePet()
    const updatedPet = { ...pet, urgent: true, name: 'Luna Updated' }
    ;(MockPet.findById as jest.Mock).mockResolvedValue(pet)
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())
    pet.save.mockResolvedValue(updatedPet)

    const res = await supertest(app.server)
      .patch(`/api/v1/pets/${pet._id}`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ urgent: true, name: 'Luna Updated' })

    expect(res.status).toBe(200)
  })

  it('returns 403 when the pet belongs to a different foundation', async () => {
    const otherFoundationId = new mongoose.Types.ObjectId()
    const pet = makePet({ foundationId: otherFoundationId })
    ;(MockPet.findById as jest.Mock).mockResolvedValue(pet)
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())

    const res = await supertest(app.server)
      .patch(`/api/v1/pets/${pet._id}`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ urgent: true })

    expect(res.status).toBe(403)
  })

  it('returns 404 for unknown pet', async () => {
    ;(MockPet.findById as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .patch(`/api/v1/pets/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ urgent: true })
    expect(res.status).toBe(404)
  })
})

// ─── DELETE /pets/:id ────────────────────────────────────────────────────────

describe('DELETE /api/v1/pets/:id', () => {
  it('deletes a pet owned by the foundation', async () => {
    const pet = makePet()
    ;(MockPet.findById as jest.Mock).mockResolvedValue(pet)
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())

    const res = await supertest(app.server)
      .delete(`/api/v1/pets/${pet._id}`)
      .set('Authorization', `Bearer ${foundationToken}`)

    expect(res.status).toBe(200)
    expect(pet.deleteOne).toHaveBeenCalled()
  })

  it('returns 403 when an adopter tries to delete', async () => {
    const pet = makePet()
    ;(MockPet.findById as jest.Mock).mockResolvedValue(pet)
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .delete(`/api/v1/pets/${pet._id}`)
      .set('Authorization', `Bearer ${adopterToken}`)

    expect(res.status).toBe(403)
  })
})
