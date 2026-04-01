export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}
