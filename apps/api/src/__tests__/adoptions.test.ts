import supertest from 'supertest'
import mongoose from 'mongoose'
import { buildApp, signToken, mockChain } from './helpers'
import { FastifyInstance } from 'fastify'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('../models/User', () => ({
  User: {
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}))

jest.mock('../models/Foundation', () => ({
  Foundation: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}))

jest.mock('../models/Pet', () => ({
  Pet: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}))

jest.mock('../models/AdoptionRequest', () => ({
  AdoptionRequest: {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('../services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    adoptionRequestReceived: jest.fn().mockReturnValue({ subject: 'test', html: '' }),
    adoptionStatusChanged: jest.fn().mockReturnValue({ subject: 'test', html: '' }),
  },
}))

jest.mock('../services/storage', () => ({
  signPhotoUrls: jest.fn((photos: string[]) => Promise.resolve(photos)),
  signPhotoUrlsBatch: jest.fn((keysPerItem: string[][]) => Promise.resolve(keysPerItem)),
}))

import { User } from '../models/User'
import { Foundation } from '../models/Foundation'
import { Pet } from '../models/Pet'
import { AdoptionRequest } from '../models/AdoptionRequest'

const MockUser = User as jest.Mocked<typeof User>
const MockFoundation = Foundation as jest.Mocked<typeof Foundation>
const MockPet = Pet as jest.Mocked<typeof Pet>
const MockAdoptionRequest = AdoptionRequest as jest.Mocked<typeof AdoptionRequest>

// ─── Fixtures ────────────────────────────────────────────────────────────────

const foundationUserId = new mongoose.Types.ObjectId()
const adopterUserId = new mongoose.Types.ObjectId()
const foundationId = new mongoose.Types.ObjectId()
const petId = new mongoose.Types.ObjectId()
const adoptionId = new mongoose.Types.ObjectId()

function makeFoundation(overrides: Record<string, any> = {}) {
  return {
    _id: foundationId,
    name: 'Patitas Rescatadas',
    ownerId: foundationUserId,
    ...overrides,
  }
}

function makePet(overrides: Record<string, any> = {}) {
  return {
    _id: petId,
    name: 'Firulais',
    species: 'dog',
    foundationId,
    status: 'available',
    photos: [],
    ...overrides,
  }
}

function makeAdoption(overrides: Record<string, any> = {}) {
  const adoption: any = {
    _id: adoptionId,
    petId,
    userId: adopterUserId,
    foundationId,
    status: 'pending',
    housingType: 'house',
    experience: 'some',
    workSchedule: 'Desde casa todo el día',
    motivation: 'Quiero darle un hogar amoroso y estable a una mascota',
    ...overrides,
  }
  adoption.save = jest.fn().mockResolvedValue(adoption)
  adoption.toObject = jest.fn(() => ({ ...adoption, petId: { ...makePet() } }))
  return adoption
}

function adoptionPayload(overrides: Record<string, any> = {}) {
  return {
    petId: petId.toString(),
    housingType: 'house',
    hasYard: true,
    hasPets: false,
    hasChildren: false,
    experience: 'some',
    workSchedule: 'Trabajo desde casa todo el día sin interrupciones',
    motivation: 'Quiero darle un hogar lleno de amor y cuidado a una mascota que lo necesita',
    ...overrides,
  }
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

// ─── POST /adoptions ──────────────────────────────────────────────────────────

describe('POST /api/v1/adoptions', () => {
  function setupHappyPath() {
    const mockOwner = { _id: foundationUserId, name: 'Fundación Owner', email: 'owner@test.com' }
    ;(MockPet.findById as jest.Mock).mockResolvedValue(makePet())
    ;(MockAdoptionRequest.findOne as jest.Mock).mockResolvedValue(null)
    ;(MockAdoptionRequest.create as jest.Mock).mockResolvedValue(makeAdoption())
    ;(MockFoundation.findById as jest.Mock).mockResolvedValue(makeFoundation())
    // Use mockChain since route calls .select('name email') on findById result
    ;(MockUser.findById as jest.Mock).mockReturnValue(mockChain(mockOwner))
  }

  it('creates an adoption request as an adopter', async () => {
    setupHappyPath()
    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .set('Authorization', `Bearer ${adopterToken}`)
      .send(adoptionPayload())

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('pending')
  })

  it('returns 403 when a foundation tries to create a request', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .set('Authorization', `Bearer ${foundationToken}`)
      .send(adoptionPayload())
    expect(res.status).toBe(403)
  })

  it('returns 401 without authentication', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .send(adoptionPayload())
    expect(res.status).toBe(401)
  })

  it('returns 409 when the pet is not available', async () => {
    ;(MockPet.findById as jest.Mock).mockResolvedValue(makePet({ status: 'adopted' }))

    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .set('Authorization', `Bearer ${adopterToken}`)
      .send(adoptionPayload())

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/disponible/i)
  })

  it('returns 409 on duplicate pending request for the same pet', async () => {
    ;(MockPet.findById as jest.Mock).mockResolvedValue(makePet())
    ;(MockAdoptionRequest.findOne as jest.Mock).mockResolvedValue(makeAdoption())

    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .set('Authorization', `Bearer ${adopterToken}`)
      .send(adoptionPayload())

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/solicitud activa/i)
  })

  it('returns 404 for unknown pet', async () => {
    ;(MockPet.findById as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .set('Authorization', `Bearer ${adopterToken}`)
      .send(adoptionPayload())
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid payload', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/adoptions')
      .set('Authorization', `Bearer ${adopterToken}`)
      .send({ petId: petId.toString(), housingType: 'tent', motivation: 'short' })
    expect(res.status).toBe(400)
  })
})

// ─── GET /adoptions/mine ─────────────────────────────────────────────────────

describe('GET /api/v1/adoptions/mine', () => {
  it("returns the adopter's own requests", async () => {
    const adoption = makeAdoption()
    adoption.toObject = jest.fn(() => ({ ...adoption, petId: { ...makePet() } }))
    ;(MockAdoptionRequest.find as jest.Mock).mockReturnValue(
      mockChain([adoption])
    )

    const res = await supertest(app.server)
      .get('/api/v1/adoptions/mine')
      .set('Authorization', `Bearer ${adopterToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 401 without authentication', async () => {
    const res = await supertest(app.server).get('/api/v1/adoptions/mine')
    expect(res.status).toBe(401)
  })
})

// ─── GET /adoptions/foundation ───────────────────────────────────────────────

describe('GET /api/v1/adoptions/foundation', () => {
  it('returns adoption requests for the owning foundation', async () => {
    const adoption = makeAdoption()
    adoption.toObject = jest.fn(() => ({ ...adoption, petId: makePet() }))
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())
    ;(MockAdoptionRequest.find as jest.Mock).mockReturnValue(mockChain([adoption]))

    const res = await supertest(app.server)
      .get('/api/v1/adoptions/foundation')
      .set('Authorization', `Bearer ${foundationToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 403 for an adopter', async () => {
    const res = await supertest(app.server)
      .get('/api/v1/adoptions/foundation')
      .set('Authorization', `Bearer ${adopterToken}`)
    expect(res.status).toBe(403)
  })
})

// ─── PATCH /adoptions/:id/status ─────────────────────────────────────────────

describe('PATCH /api/v1/adoptions/:id/status', () => {
  function setupStatusUpdate(adoptionOverrides: Record<string, any> = {}) {
    const adoption = makeAdoption(adoptionOverrides)
    const mockAdopter = { _id: adopterUserId, name: 'Adoptante', email: 'adopter@test.com' }
    ;(MockAdoptionRequest.findById as jest.Mock).mockResolvedValue(adoption)
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())
    // Use mockChain so .select() is supported on User.findById(...)
    ;(MockUser.findById as jest.Mock).mockReturnValue(mockChain(mockAdopter))
    ;(MockPet.findById as jest.Mock).mockResolvedValue(makePet())
    // findOneAndUpdate returns the pet by default (simulates pet was available)
    ;(MockPet.findOneAndUpdate as jest.Mock).mockResolvedValue(makePet())
    return adoption
  }

  it('foundation can move request to reviewing', async () => {
    setupStatusUpdate()

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'reviewing' })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('reviewing')
  })

  it('atomically sets pet to in_process when approved', async () => {
    const adoption = setupStatusUpdate()

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'approved' })

    expect(res.status).toBe(200)
    expect(MockPet.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: adoption.petId, status: 'available' },
      { status: 'in_process' },
    )
  })

  it('returns 409 when pet was already approved by a concurrent request', async () => {
    setupStatusUpdate()
    // Simulate race: findOneAndUpdate finds no pet with status 'available'
    ;(MockPet.findOneAndUpdate as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'approved' })

    expect(res.status).toBe(409)
  })

  it('atomically sets pet to adopted when completed', async () => {
    setupStatusUpdate()

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'completed' })

    expect(res.status).toBe(200)
    expect(MockPet.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: petId, status: 'in_process' },
      { status: 'adopted' },
    )
  })

  it('atomically restores pet to available when rejected', async () => {
    setupStatusUpdate()

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'rejected' })

    expect(res.status).toBe(200)
    expect(MockPet.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: petId, status: 'in_process' },
      { status: 'available' },
    )
  })

  it('returns 403 when an adopter tries to update status', async () => {
    const adoption = makeAdoption()
    ;(MockAdoptionRequest.findById as jest.Mock).mockResolvedValue(adoption)
    // Adopter has no associated foundation — route should reject
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${adopterToken}`)
      .send({ status: 'reviewing' })

    expect(res.status).toBe(403)
  })

  it('returns 400 for an invalid status value', async () => {
    setupStatusUpdate()

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${adoptionId}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'invalid_status' })

    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown adoption', async () => {
    ;(MockAdoptionRequest.findById as jest.Mock).mockResolvedValue(null)
    ;(MockFoundation.findOne as jest.Mock).mockResolvedValue(makeFoundation())

    const res = await supertest(app.server)
      .patch(`/api/v1/adoptions/${new mongoose.Types.ObjectId()}/status`)
      .set('Authorization', `Bearer ${foundationToken}`)
      .send({ status: 'reviewing' })

    expect(res.status).toBe(404)
  })
})
