import supertest from 'supertest'
import mongoose from 'mongoose'
import { buildApp, signToken, mockChain, nullQuery } from './helpers'
import { FastifyInstance } from 'fastify'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}))

jest.mock('../models/Foundation', () => ({
  Foundation: {
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}))

jest.mock('../services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    resetPassword: jest.fn().mockReturnValue({ subject: 'Reset', html: '<p>reset</p>' }),
  },
}))

import { User } from '../models/User'
import { Foundation } from '../models/Foundation'

const MockUser = User as jest.Mocked<typeof User>
const MockFoundation = Foundation as jest.Mocked<typeof Foundation>

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'adopter',
    active: true,
    tokenVersion: 0,
    password: '$2b$12$hashedpassword',
    resetPasswordToken: undefined as string | undefined,
    resetPasswordExpires: undefined as Date | undefined,
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

let app: FastifyInstance

beforeAll(async () => { app = await buildApp() })
afterAll(async () => { await app.close() })
beforeEach(() => jest.clearAllMocks())

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  const payload = { name: 'María López', email: 'maria@test.com', password: 'Secret123' }

  it('creates a user and returns tokens', async () => {
    const user = makeUser({ email: payload.email, name: payload.name })
    ;(MockUser.findOne as jest.Mock).mockResolvedValue(null)
    ;(MockUser.create as jest.Mock).mockResolvedValue(user)

    const res = await supertest(app.server).post('/api/v1/auth/register').send(payload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.tokens.accessToken).toBeDefined()
    expect(res.body.data.tokens.refreshToken).toBeDefined()
    expect(res.body.data.user.email).toBe(payload.email)
  })

  it('returns 409 when email already exists', async () => {
    ;(MockUser.findOne as jest.Mock).mockResolvedValue(makeUser())

    const res = await supertest(app.server).post('/api/v1/auth/register').send(payload)
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 for invalid payload', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({ name: 'X', email: 'bad', password: 'weak' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  const payload = { email: 'user@test.com', password: 'Secret123' }

  it('returns tokens on correct credentials', async () => {
    const user = makeUser({ email: payload.email })
    ;(MockUser.findOne as jest.Mock).mockReturnValue(mockChain(user))

    const res = await supertest(app.server).post('/api/v1/auth/login').send(payload)
    expect(res.status).toBe(200)
    expect(res.body.data.tokens.accessToken).toBeDefined()
  })

  it('returns 401 for wrong password', async () => {
    const user = makeUser({ comparePassword: jest.fn().mockResolvedValue(false) })
    ;(MockUser.findOne as jest.Mock).mockReturnValue(mockChain(user))

    const res = await supertest(app.server).post('/api/v1/auth/login').send(payload)
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    ;(MockUser.findOne as jest.Mock).mockReturnValue(mockChain(null))

    const res = await supertest(app.server).post('/api/v1/auth/login').send(payload)
    expect(res.status).toBe(401)
  })

  it('returns 403 for suspended account', async () => {
    const user = makeUser({ active: false })
    ;(MockUser.findOne as jest.Mock).mockReturnValue(mockChain(user))

    const res = await supertest(app.server).post('/api/v1/auth/login').send(payload)
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid payload', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({ email: 'bad-email', password: '' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('issues a new access token for a valid refresh token', async () => {
    const user = makeUser()
    const refreshToken = app.jwt.sign(
      { userId: user._id.toString(), type: 'refresh', tokenVersion: 0 },
      { expiresIn: '30d' }
    )
    ;(MockUser.findById as jest.Mock).mockResolvedValue({ ...user, active: true })

    const res = await supertest(app.server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('returns 400 when no refresh token provided', async () => {
    const res = await supertest(app.server).post('/api/v1/auth/refresh').send({})
    expect(res.status).toBe(400)
  })

  it('returns 401 for a tampered token', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'completely.fake.token' })
    expect(res.status).toBe(401)
  })

  it('returns 401 when an access token is passed instead of a refresh token', async () => {
    const user = makeUser()
    const accessToken = signToken(app, { userId: user._id.toString(), role: user.role })

    const res = await supertest(app.server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: accessToken })
    expect(res.status).toBe(401)
  })

  it('returns 401 when user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const refreshToken = app.jwt.sign(
      { userId: fakeId.toString(), type: 'refresh', tokenVersion: 0 },
      { expiresIn: '30d' }
    )
    ;(MockUser.findById as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
    expect(res.status).toBe(401)
  })

  it('returns 401 when tokenVersion does not match (token was invalidated by logout)', async () => {
    const user = makeUser({ tokenVersion: 1 }) // version bumped after logout
    const refreshToken = app.jwt.sign(
      { userId: user._id.toString(), type: 'refresh', tokenVersion: 0 }, // old version
      { expiresIn: '30d' }
    )
    ;(MockUser.findById as jest.Mock).mockResolvedValue(user)

    const res = await supertest(app.server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })

    expect(res.status).toBe(401)
  })
})

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('increments tokenVersion and returns 200', async () => {
    const user = makeUser()
    const token = signToken(app, { userId: user._id.toString(), role: 'adopter' })
    ;(MockUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(undefined)

    const res = await supertest(app.server)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(MockUser.findByIdAndUpdate).toHaveBeenCalledWith(
      user._id.toString(),
      { $inc: { tokenVersion: 1 } }
    )
  })

  it('returns 401 without authentication', async () => {
    const res = await supertest(app.server).post('/api/v1/auth/logout')
    expect(res.status).toBe(401)
  })
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  it('returns the current user profile', async () => {
    const user = makeUser()
    const token = signToken(app, { userId: user._id.toString(), role: 'adopter' })
    ;(MockUser.findById as jest.Mock).mockResolvedValue(user)

    const res = await supertest(app.server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('returns 401 without a token', async () => {
    const res = await supertest(app.server).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns 404 when user no longer exists', async () => {
    const user = makeUser()
    const token = signToken(app, { userId: user._id.toString(), role: 'adopter' })
    ;(MockUser.findById as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})

// ─── POST /auth/forgot-password ───────────────────────────────────────────────

describe('POST /api/v1/auth/forgot-password', () => {
  it('always returns 200 regardless of whether email exists', async () => {
    ;(MockUser.findOne as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@test.com' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('sets a reset token when the email is found', async () => {
    const user = makeUser()
    ;(MockUser.findOne as jest.Mock).mockResolvedValue(user)

    await supertest(app.server)
      .post('/api/v1/auth/forgot-password')
      .send({ email: user.email })

    expect(user.save).toHaveBeenCalled()
    expect(user.resetPasswordToken).toBeDefined()
  })

  it('returns 400 for an invalid email', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /auth/reset-password ────────────────────────────────────────────────

describe('POST /api/v1/auth/reset-password', () => {
  it('resets the password with a valid token', async () => {
    const user = makeUser()
    ;(MockUser.findOne as jest.Mock).mockResolvedValue(user)

    const res = await supertest(app.server)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'valid-token', password: 'NewPass1' })

    expect(res.status).toBe(200)
    expect(user.save).toHaveBeenCalled()
    expect(user.resetPasswordToken).toBeUndefined()
  })

  it('returns 400 for an expired or unknown token', async () => {
    ;(MockUser.findOne as jest.Mock).mockResolvedValue(null)

    const res = await supertest(app.server)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'expired-token', password: 'NewPass1' })

    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid new password', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'some-token', password: 'weak' })
    expect(res.status).toBe(400)
  })
})
