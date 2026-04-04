import { createAdoptionRequestSchema } from '../adoption'

const validRequest = {
  petId: '507f1f77bcf86cd799439011',
  housingType: 'house',
  hasYard: true,
  hasPets: false,
  hasChildren: true,
  experience: 'some',
  workSchedule: 'Trabajo de 9 a 5, tengo a alguien en casa',
  motivation: 'Quiero darle un hogar amoroso a una mascota que lo necesita mucho',
}

describe('createAdoptionRequestSchema', () => {
  it('accepts a valid adoption request', () => {
    expect(createAdoptionRequestSchema.safeParse(validRequest).success).toBe(true)
  })

  it('defaults boolean fields to false', () => {
    const minimal = {
      petId: '507f1f77bcf86cd799439011',
      housingType: 'apartment',
      experience: 'none',
      workSchedule: 'Trabajo remoto desde casa todo el día',
      motivation: 'Siempre quise adoptar y ahora tengo espacio para hacerlo',
    }
    const result = createAdoptionRequestSchema.safeParse(minimal)
    if (!result.success) throw new Error(JSON.stringify(result.error.flatten()))
    expect(result.data.hasYard).toBe(false)
    expect(result.data.hasPets).toBe(false)
    expect(result.data.hasChildren).toBe(false)
  })

  it('rejects missing petId', () => {
    const { petId: _, ...rest } = validRequest
    expect(createAdoptionRequestSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid housingType', () => {
    expect(createAdoptionRequestSchema.safeParse({ ...validRequest, housingType: 'tent' }).success).toBe(false)
  })

  it('rejects invalid experience value', () => {
    expect(createAdoptionRequestSchema.safeParse({ ...validRequest, experience: 'expert' }).success).toBe(false)
  })

  it('rejects workSchedule shorter than 5 chars', () => {
    expect(createAdoptionRequestSchema.safeParse({ ...validRequest, workSchedule: '9-5' }).success).toBe(false)
  })

  it('rejects motivation shorter than 20 chars', () => {
    expect(createAdoptionRequestSchema.safeParse({ ...validRequest, motivation: 'Me gustan' }).success).toBe(false)
  })

  it('accepts optional additionalInfo', () => {
    const result = createAdoptionRequestSchema.safeParse({
      ...validRequest,
      additionalInfo: 'Tengo un jardín amplio',
    })
    expect(result.success).toBe(true)
  })
})
