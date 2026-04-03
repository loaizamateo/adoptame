import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('adoptame-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.accessToken ?? null
  } catch {
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
