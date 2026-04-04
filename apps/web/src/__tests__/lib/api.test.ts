/**
 * @jest-environment node
 */
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

// Provide minimal browser-like globals that api.ts expects
const locationMock = { href: '' }
const localStore: Record<string, string> = {}

;(global as any).window = {
  location: locationMock,
  localStorage: {
    getItem: (k: string) => localStore[k] ?? null,
    setItem: (k: string, v: string) => { localStore[k] = v },
    removeItem: (k: string) => { delete localStore[k] },
    clear: () => { for (const k in localStore) delete localStore[k] },
  },
}
;(global as any).localStorage = (global as any).window.localStorage

// Import AFTER setting up globals so interceptors close over our mocks
import { api } from '../../lib/api'

const apiMock = new MockAdapter(api)
const axiosMock = new MockAdapter(axios)

function setStoredAuth(accessToken: string | null, refreshToken: string | null) {
  if (!accessToken) {
    (global as any).window.localStorage.clear()
    return
  }
  ;(global as any).window.localStorage.setItem(
    'adoptame-auth',
    JSON.stringify({ state: { accessToken, refreshToken } })
  )
}

afterEach(() => {
  apiMock.reset()
  axiosMock.reset()
  ;(global as any).window.localStorage.clear()
  locationMock.href = ''
})

// ─── Request interceptor ──────────────────────────────────────────────────────

describe('request interceptor', () => {
  it('attaches Authorization header when a token is stored', async () => {
    setStoredAuth('my-access-token', 'my-refresh-token')
    apiMock.onGet('/pets').reply(200, { success: true, data: [] })

    const res = await api.get('/pets')
    expect(res.config.headers?.Authorization).toBe('Bearer my-access-token')
  })

  it('does not attach Authorization header when no token is stored', async () => {
    apiMock.onGet('/pets').reply(200, { success: true, data: [] })

    const res = await api.get('/pets')
    expect(res.config.headers?.Authorization).toBeUndefined()
  })
})

// ─── Response interceptor — token refresh ────────────────────────────────────

describe('response interceptor — 401 handling', () => {
  it('refreshes token and retries the original request on 401', async () => {
    setStoredAuth('expired-token', 'valid-refresh-token')

    let callCount = 0
    apiMock
      .onGet('/protected')
      .reply(() => {
        callCount++
        if (callCount === 1) return [401, { error: 'Unauthorized' }]
        return [200, { success: true, data: 'secret' }]
      })

    axiosMock
      .onPost('http://localhost:3001/api/v1/auth/refresh')
      .reply(200, { data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' } })

    const res = await api.get('/protected')
    expect(res.status).toBe(200)
    expect(callCount).toBe(2)
  })

  it('redirects to /login when no refresh token is stored', async () => {
    // No stored auth
    apiMock.onGet('/protected').reply(401, { error: 'Unauthorized' })

    await expect(api.get('/protected')).rejects.toThrow()
    expect(locationMock.href).toBe('/login')
  })

  it('redirects to /login when the refresh request fails', async () => {
    setStoredAuth('expired-token', 'bad-refresh-token')

    apiMock.onGet('/protected').reply(401, { error: 'Unauthorized' })
    axiosMock
      .onPost('http://localhost:3001/api/v1/auth/refresh')
      .reply(401, { error: 'Invalid refresh token' })

    await expect(api.get('/protected')).rejects.toThrow()
    expect(locationMock.href).toBe('/login')
  })

  it('does not retry on non-401 errors', async () => {
    apiMock.onGet('/missing').reply(404, { error: 'Not found' })

    await expect(api.get('/missing')).rejects.toMatchObject({
      response: { status: 404 },
    })
  })
})
