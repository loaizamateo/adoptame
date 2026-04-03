import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

function getStoredAuth() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('adoptame-auth')
    if (!raw) return null
    return JSON.parse(raw)?.state ?? null
  } catch { return null }
}

function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('adoptame-auth')
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.state.accessToken = accessToken
    parsed.state.refreshToken = refreshToken
    localStorage.setItem('adoptame-auth', JSON.stringify(parsed))
  } catch {}
}

api.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`
  return config
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const auth = getStoredAuth()
      if (!auth?.refreshToken) {
        isRefreshing = false
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
          { refreshToken: auth.refreshToken }
        )
        const { accessToken, refreshToken } = res.data.data
        saveTokens(accessToken, refreshToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
