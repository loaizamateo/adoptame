import { api } from './api'

export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/stats')
    return res.data.data
  },
  getFoundations: async (verified?: boolean) => {
    const res = await api.get('/admin/foundations', { params: verified !== undefined ? { verified } : {} })
    return res.data.data
  },
  verifyFoundation: async (id: string, verified: boolean) => {
    const res = await api.patch(`/admin/foundations/${id}/verify`, { verified })
    return res.data.data
  },
  getUsers: async (params?: { role?: string; page?: number }) => {
    const res = await api.get('/admin/users', { params })
    return res.data.data
  },
  toggleUser: async (id: string) => {
    const res = await api.patch(`/admin/users/${id}/toggle`)
    return res.data.data
  },
  getPets: async (params?: { status?: string; page?: number }) => {
    const res = await api.get('/admin/pets', { params })
    return res.data.data
  },
}
