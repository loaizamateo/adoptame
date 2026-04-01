import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@adoptame/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, tokens) =>
        set({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    { name: 'adoptame-auth' }
  )
)
