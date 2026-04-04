import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../auth'

describe('registerSchema', () => {
  const valid = { name: 'Ana García', email: 'ana@example.com', password: 'Secret123' }

  it('accepts a valid payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('defaults role to adopter', () => {
    const result = registerSchema.safeParse(valid)
    expect(result.success && result.data.role).toBe('adopter')
  })

  it('accepts foundation role', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'foundation' })
    expect(result.success && result.data.role).toBe('foundation')
  })

  it('rejects name shorter than 2 chars', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'Ab1' })
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('rejects password without a number', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'SecretABC' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown role', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'admin' })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'anything' }).success).toBe(true)
  })

  it('rejects empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: 'pw' }).success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'test@test.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  const valid = { token: 'abc123', password: 'NewPass1' }

  it('accepts valid payload', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects password without uppercase', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, password: 'newpass1' }).success).toBe(false)
  })

  it('rejects password without number', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, password: 'NewPassAA' }).success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, password: 'N1' }).success).toBe(false)
  })
})
