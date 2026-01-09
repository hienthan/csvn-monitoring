import { ClientResponseError } from 'pocketbase'

export interface ApiError {
  message: string
  status?: number
  data?: unknown
}

/**
 * Handle PocketBase errors and convert to a user-friendly format
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ClientResponseError) {
    return {
      message: error.message || 'An error occurred',
      status: error.status,
      data: error.data,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
    }
  }

  return {
    message: 'An unexpected error occurred',
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: ApiError): string {
  if (error.status === 404) {
    return 'Resource not found'
  }
  if (error.status === 403) {
    return 'Access denied'
  }
  if (error.status === 401) {
    return 'Unauthorized'
  }
  if (error.status && error.status >= 500) {
    return 'Server error. Please try again later.'
  }
  return error.message
}

