import { api } from './api'

export interface FosterHome {
  _id: string
  userId: { _id: string; name: string; avatar?: string; city?: string }
  name: string
  bio?: string
  city: string
  country: string
  phone?: string
  acceptedSpecies: ('dog' | 'cat' | 'other')[]
  acceptedSizes: ('small' | 'medium' | 'large')[]
  capacity: number
  currentCount: number
  acceptsKids: boolean
  acceptsPets: boolean
  status: 'available' | 'occupied' | 'inactive'
  experience?: string
  photos?: string[]
  createdAt: string
}

export interface FosterHomeFilters {
  city?: string
  species?: string
  size?: string
  status?: string
  page?: number
  limit?: number
}

export async function getFosterHomes(filters?: FosterHomeFilters) {
  const res = await api.get('/foster-homes', { params: filters })
  return res.data as { homes: FosterHome[]; pagination: { total: number; page: number; pages: number } }
}

export async function getMyFosterHome() {
  const res = await api.get('/foster-homes/mine')
  return res.data as FosterHome
}

export async function getFosterHomeById(id: string) {
  const res = await api.get(`/foster-homes/${id}`)
  return res.data as FosterHome
}

export async function createFosterHome(data: Partial<FosterHome>) {
  const res = await api.post('/foster-homes', data)
  return res.data as FosterHome
}

export async function updateFosterHome(id: string, data: Partial<FosterHome>) {
  const res = await api.patch(`/foster-homes/${id}`, data)
  return res.data as FosterHome
}

export async function deleteFosterHome(id: string) {
  await api.delete(`/foster-homes/${id}`)
}
