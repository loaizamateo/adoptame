import { z } from 'zod'
import { LOCATIONS } from './locations'

const validCities = LOCATIONS.map(l => l.city)
const validCountries = [...new Set(LOCATIONS.map(l => l.country))]

export const PetSpecies = z.enum(['dog', 'cat', 'other'])
export const PetSize = z.enum(['small', 'medium', 'large'])
export const PetAge = z.enum(['puppy', 'young', 'adult', 'senior'])
export const PetSex = z.enum(['male', 'female'])
export const PetStatus = z.enum(['available', 'in_process', 'adopted'])

export const createPetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  species: PetSpecies,
  breed: z.string().optional(),
  age: PetAge,
  size: PetSize,
  sex: PetSex,
  color: z.string().optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  story: z.string().optional(),
  compatibleWithKids: z.boolean().default(false),
  compatibleWithPets: z.boolean().default(false),
  vaccinated: z.boolean().default(false),
  sterilized: z.boolean().default(false),
  dewormed: z.boolean().default(false),
  urgent: z.boolean().default(false),
  city: z.string().refine(v => validCities.includes(v), { message: 'Ciudad no válida' }),
  country: z.string().refine(v => validCountries.includes(v), { message: 'País no válido' }),
  photos: z.array(z.string()).optional(),
  status: PetStatus.optional(),
})

export const updatePetSchema = createPetSchema.partial()

export type CreatePetInput = z.infer<typeof createPetSchema>
export type UpdatePetInput = z.infer<typeof updatePetSchema>
