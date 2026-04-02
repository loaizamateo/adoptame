import { z } from 'zod'

export const createFoundationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().min(1, 'El país es requerido'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
})

export const updateFoundationSchema = createFoundationSchema.partial()

export type CreateFoundationInput = z.infer<typeof createFoundationSchema>
export type UpdateFoundationInput = z.infer<typeof updateFoundationSchema>

export const donationLinksSchema = z.object({
  nequi: z.string().optional(),
  daviplata: z.string().optional(),
  paypal: z.string().url().optional().or(z.literal('')),
  bancolombia: z.string().optional(),
  mercadopago: z.string().url().optional().or(z.literal('')),
  other: z.string().optional(),
})

export const updateFoundationDonationsSchema = z.object({
  donationLinks: donationLinksSchema,
})

export type UpdateFoundationDonationsInput = z.infer<typeof updateFoundationDonationsSchema>
