export interface SubmitResult<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

export interface SubmitCallbacks<T = unknown> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  onComplete?: () => void
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}
