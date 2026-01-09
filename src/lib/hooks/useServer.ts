import { useState, useEffect, useCallback } from 'react'
import { serverService } from '@/services/serverService'
import type { Server } from '@/types/server'
import { useApiError } from './useApiError'

export function useServer(serverId: string | undefined) {
  const [server, setServer] = useState<Server | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchServer = useCallback(async () => {
    if (!serverId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await serverService.getById(serverId)
      setServer(data)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [serverId, handleError])

  useEffect(() => {
    fetchServer()
  }, [fetchServer])

  return {
    server,
    loading,
    error,
    refetch: fetchServer,
  }
}

