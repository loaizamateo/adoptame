import { api } from './api'
import type { AdoptionRequest } from '@adoptame/types'

export async function createAdoptionRequest(data: any) {
  const res = await api.post('/adoptions', data)
  return res.data.data as AdoptionRequest
}

export async function getMyAdoptions() {
  const res = await api.get('/adoptions/mine')
  return res.data.data as AdoptionRequest[]
}

export async function getFoundationAdoptions(status?: string) {
  const res = await api.get('/adoptions/foundation', { params: { status } })
  return res.data.data as AdoptionRequest[]
}

export async function getAdoptionById(id: string) {
  const res = await api.get(`/adoptions/${id}`)
  return res.data.data as AdoptionRequest
}

export async function updateAdoptionStatus(id: string, status: string, notes?: string) {
  const res = await api.patch(`/adoptions/${id}/status`, { status, notes })
  return res.data.data as AdoptionRequest
}
