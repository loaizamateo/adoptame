export type UserRole = 'adopter' | 'foundation' | 'admin'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  city?: string
  country?: string
  foundationId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
