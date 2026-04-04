import { z } from 'zod'
import { LOCATIONS } from './locations'

const validCities = LOCATIONS.map(l => l.city)
const validCountries = [...new Set(LOCATIONS.map(l => l.country))]

export const createFoundationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  city: z.string().refine(v => validCities.includes(v), { message: 'Ciudad no válida' }),
  country: z.string().refine(v => validCountries.includes(v), { message: 'País no válido' }),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
})

export const donationLinksSchema = z.object({
  nequi: z.string().optional(),
  daviplata: z.string().optional(),
  paypal: z.string().url().optional().or(z.literal('')),
  bancolombia: z.string().optional(),
  mercadopago: z.string().url().optional().or(z.literal('')),
  other: z.string().optional(),
})

export const updateFoundationSchema = createFoundationSchema.partial().extend({
  donationLinks: donationLinksSchema.optional(),
})

export const updateFoundationDonationsSchema = z.object({
  donationLinks: donationLinksSchema,
})

export type CreateFoundationInput = z.infer<typeof createFoundationSchema>
export type UpdateFoundationInput = z.infer<typeof updateFoundationSchema>
export type UpdateFoundationDonationsInput = z.infer<typeof updateFoundationDonationsSchema>
