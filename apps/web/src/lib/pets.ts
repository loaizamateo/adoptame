import { api } from './api'
import type { Pet, PetFilters, PaginatedPets } from '@adoptame/types'

export async function getPets(filters?: PetFilters) {
  const res = await api.get('/pets', { params: filters })
  return res.data.data as PaginatedPets
}

export async function getPetById(id: string) {
  const res = await api.get(`/pets/${id}`)
  return res.data.data as Pet
}

export async function getMyPets(params?: { status?: string; page?: number; limit?: number }) {
  const res = await api.get('/pets/mine', { params })
  return res.data.data as { data: Pet[]; total: number; page: number; totalPages: number }
}

export async function createPet(data: any) {
  const res = await api.post('/pets', data)
  return res.data.data as Pet
}

export async function updatePet(id: string, data: any) {
  const res = await api.patch(`/pets/${id}`, data)
  return res.data.data as Pet
}

export async function deletePet(id: string) {
  await api.delete(`/pets/${id}`)
}

export async function uploadPetPhoto(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // Guardar el key (no la URL firmada que expira) — la API firma al consultar
  return (res.data.data.key || res.data.data.url) as string
}
