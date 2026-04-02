export interface Foundation {
  _id: string
  name: string
  slug: string
  description: string
  logo?: string
  city: string
  country: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  verified: boolean
  ownerId: string
  totalPets?: number
  totalAdoptions?: number
  createdAt: string
  updatedAt: string
}
