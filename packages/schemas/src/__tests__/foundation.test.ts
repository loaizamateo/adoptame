import { createFoundationSchema, donationLinksSchema, updateFoundationSchema } from '../foundation'

const validFoundation = {
  name: 'Huellas Felices',
  description: 'Fundación dedicada al rescate y adopción de animales en situación de calle',
  city: 'Bogotá',
  country: 'Colombia',
}

describe('createFoundationSchema', () => {
  it('accepts a valid foundation', () => {
    expect(createFoundationSchema.safeParse(validFoundation).success).toBe(true)
  })

  it('rejects name shorter than 2 chars', () => {
    expect(createFoundationSchema.safeParse({ ...validFoundation, name: 'A' }).success).toBe(false)
  })

  it('rejects description shorter than 20 chars', () => {
    expect(createFoundationSchema.safeParse({ ...validFoundation, description: 'Muy corta' }).success).toBe(false)
  })

  it('rejects invalid city', () => {
    expect(createFoundationSchema.safeParse({ ...validFoundation, city: 'Ciudad Fantasma' }).success).toBe(false)
  })

  it('rejects invalid country', () => {
    expect(createFoundationSchema.safeParse({ ...validFoundation, country: 'Narnia' }).success).toBe(false)
  })

  it('accepts valid website URL', () => {
    const result = createFoundationSchema.safeParse({ ...validFoundation, website: 'https://fundacion.org' })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for website', () => {
    const result = createFoundationSchema.safeParse({ ...validFoundation, website: '' })
    expect(result.success).toBe(true)
  })

  it('rejects non-empty invalid URL for website', () => {
    const result = createFoundationSchema.safeParse({ ...validFoundation, website: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('accepts optional social fields', () => {
    const result = createFoundationSchema.safeParse({
      ...validFoundation,
      phone: '3001234567',
      instagram: '@huellas_felices',
      facebook: 'HuellasFeliCes',
    })
    expect(result.success).toBe(true)
  })
})

describe('donationLinksSchema', () => {
  it('accepts an empty object', () => {
    expect(donationLinksSchema.safeParse({}).success).toBe(true)
  })

  it('accepts valid donation links', () => {
    const result = donationLinksSchema.safeParse({
      nequi: '3001234567',
      paypal: 'https://paypal.me/fundacion',
      mercadopago: 'https://mpago.la/abc123',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for url fields', () => {
    expect(donationLinksSchema.safeParse({ paypal: '', mercadopago: '' }).success).toBe(true)
  })

  it('rejects invalid URL for paypal', () => {
    expect(donationLinksSchema.safeParse({ paypal: 'not-a-url' }).success).toBe(false)
  })
})

describe('updateFoundationSchema', () => {
  it('accepts an empty object', () => {
    expect(updateFoundationSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update with donation links', () => {
    const result = updateFoundationSchema.safeParse({
      name: 'Nuevo nombre',
      donationLinks: { nequi: '3009876543' },
    })
    expect(result.success).toBe(true)
  })
})
