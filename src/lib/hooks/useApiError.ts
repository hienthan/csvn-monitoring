import { useState, useCallback } from 'react'
import { handleApiError, formatErrorMessage, type ApiError } from '../errorHandler'

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null)

  const handleError = useCallback((err: unknown) => {
    const apiError = handleApiError(err)
    setError(apiError)
    return apiError
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const errorMessage = error ? formatErrorMessage(error) : null

  return {
    error,
    errorMessage,
    handleError,
    clearError,
  }
}

