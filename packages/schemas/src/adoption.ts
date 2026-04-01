import { z } from 'zod'

export const createAdoptionRequestSchema = z.object({
  petId: z.string().min(1, 'La mascota es requerida'),
  housingType: z.enum(['house', 'apartment', 'farm'], {
    required_error: 'El tipo de vivienda es requerido',
  }),
  hasYard: z.boolean().default(false),
  hasPets: z.boolean().default(false),
  hasChildren: z.boolean().default(false),
  experience: z.enum(['none', 'some', 'experienced']),
  workSchedule: z.string().min(5, 'Describe tu horario de trabajo'),
  motivation: z.string().min(20, 'Cuéntanos por qué quieres adoptar esta mascota'),
  additionalInfo: z.string().optional(),
})

export type CreateAdoptionRequestInput = z.infer<typeof createAdoptionRequestSchema>
