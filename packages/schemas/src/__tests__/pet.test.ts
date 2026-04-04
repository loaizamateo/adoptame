import { createPetSchema, updatePetSchema } from '../pet'

const validPet = {
  name: 'Max',
  species: 'dog',
  age: 'young',
  size: 'medium',
  sex: 'male',
  description: 'Un perro muy amigable y juguetón',
  city: 'Bogotá',
  country: 'Colombia',
}

describe('createPetSchema', () => {
  it('accepts a valid pet', () => {
    expect(createPetSchema.safeParse(validPet).success).toBe(true)
  })

  it('defaults boolean flags to false', () => {
    const result = createPetSchema.safeParse(validPet)
    if (!result.success) throw new Error('Expected success')
    expect(result.data.compatibleWithKids).toBe(false)
    expect(result.data.vaccinated).toBe(false)
    expect(result.data.urgent).toBe(false)
  })

  it('rejects missing name', () => {
    expect(createPetSchema.safeParse({ ...validPet, name: '' }).success).toBe(false)
  })

  it('rejects invalid species', () => {
    expect(createPetSchema.safeParse({ ...validPet, species: 'hamster' }).success).toBe(false)
  })

  it('rejects invalid age', () => {
    expect(createPetSchema.safeParse({ ...validPet, age: 'old' }).success).toBe(false)
  })

  it('rejects invalid size', () => {
    expect(createPetSchema.safeParse({ ...validPet, size: 'huge' }).success).toBe(false)
  })

  it('rejects invalid sex', () => {
    expect(createPetSchema.safeParse({ ...validPet, sex: 'unknown' }).success).toBe(false)
  })

  it('rejects description shorter than 10 chars', () => {
    expect(createPetSchema.safeParse({ ...validPet, description: 'Short' }).success).toBe(false)
  })

  it('rejects an invalid city', () => {
    expect(createPetSchema.safeParse({ ...validPet, city: 'Ciudad Inexistente XYZ' }).success).toBe(false)
  })

  it('rejects an invalid country', () => {
    expect(createPetSchema.safeParse({ ...validPet, country: 'Atlantis' }).success).toBe(false)
  })

  it('accepts optional fields (breed, color, story, photos)', () => {
    const result = createPetSchema.safeParse({
      ...validPet,
      breed: 'Labrador',
      color: 'Amarillo',
      story: 'Fue rescatado de la calle',
      photos: ['pets/photo1.jpg'],
    })
    expect(result.success).toBe(true)
  })
})

describe('updatePetSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(updatePetSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update', () => {
    expect(updatePetSchema.safeParse({ name: 'Nuevo nombre', urgent: true }).success).toBe(true)
  })

  it('still validates fields that are provided', () => {
    expect(updatePetSchema.safeParse({ species: 'invalid' }).success).toBe(false)
  })
})
