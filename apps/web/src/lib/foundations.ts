import { api } from './api'
import type { Foundation } from '@adoptame/types'

export async function getFoundations(params?: { city?: string; country?: string; verified?: boolean }) {
  const res = await api.get('/foundations', { params })
  return res.data.data as Foundation[]
}

export async function getFoundationBySlug(slug: string) {
  const res = await api.get(`/foundations/${slug}`)
  return res.data.data as { foundation: Foundation; pets: any[] }
}

export async function createFoundation(data: any) {
  const res = await api.post('/foundations', data)
  return res.data.data as Foundation
}

export async function updateFoundation(id: string, data: any) {
  const res = await api.patch(`/foundations/${id}`, data)
  return res.data.data as Foundation
}

export async function uploadFoundationLogo(foundationId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(`/foundations/${foundationId}/logo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data as { logoUrl: string }
}
