import { act } from '@testing-library/react'
import { useAuthStore } from '../../store/auth'
import type { User } from '@adoptame/types'

const mockUser: User = {
  _id: 'user-123',
  name: 'Ana García',
  email: 'ana@test.com',
  role: 'adopter',
  active: true,
}

const mockTokens = {
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
}

beforeEach(() => {
  // Reset the store to initial state before each test
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    _hasHydrated: false,
  })
  localStorage.clear()
})

describe('useAuthStore — setAuth', () => {
  it('stores user and tokens', () => {
    act(() => useAuthStore.getState().setAuth(mockUser, mockTokens))

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe(mockTokens.accessToken)
    expect(state.refreshToken).toBe(mockTokens.refreshToken)
  })
})

describe('useAuthStore — logout', () => {
  it('clears user and tokens', () => {
    act(() => useAuthStore.getState().setAuth(mockUser, mockTokens))
    act(() => useAuthStore.getState().logout())

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })
})

describe('useAuthStore — isAuthenticated', () => {
  it('returns false when no access token', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('returns true after setAuth', () => {
    act(() => useAuthStore.getState().setAuth(mockUser, mockTokens))
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('returns false after logout', () => {
    act(() => useAuthStore.getState().setAuth(mockUser, mockTokens))
    act(() => useAuthStore.getState().logout())
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})

describe('useAuthStore — setHasHydrated', () => {
  it('updates _hasHydrated flag', () => {
    expect(useAuthStore.getState()._hasHydrated).toBe(false)
    act(() => useAuthStore.getState().setHasHydrated(true))
    expect(useAuthStore.getState()._hasHydrated).toBe(true)
  })
})
