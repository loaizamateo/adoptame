export type PetSpecies = 'dog' | 'cat' | 'other'
export type PetSize = 'small' | 'medium' | 'large'
export type PetAge = 'puppy' | 'young' | 'adult' | 'senior'
export type PetSex = 'male' | 'female'
export type PetStatus = 'available' | 'in_process' | 'adopted'

export interface Pet {
  _id: string
  name: string
  species: PetSpecies
  breed?: string
  age: PetAge
  size: PetSize
  sex: PetSex
  color?: string
  description: string
  story?: string
  photos: string[]
  status: PetStatus
  compatibleWithKids: boolean
  compatibleWithPets: boolean
  vaccinated: boolean
  sterilized: boolean
  dewormed: boolean
  urgent: boolean
  city: string
  country: string
  foundationId: string
  foundation?: FoundationBasic
  createdAt: string
  updatedAt: string
}

export interface FoundationBasic {
  _id: string
  name: string
  logo?: string
  city: string
  country: string
  verified: boolean
}

export interface PetFilters {
  species?: PetSpecies
  size?: PetSize
  age?: PetAge
  sex?: PetSex
  city?: string
  country?: string
  compatibleWithKids?: boolean
  compatibleWithPets?: boolean
  urgent?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedPets {
  data: Pet[]
  total: number
  page: number
  totalPages: number
}
