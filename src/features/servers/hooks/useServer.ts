import { useState, useEffect, useCallback } from 'react'
import { serverService } from '../services/serverService'
import type { Server } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'

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

  const update = useCallback(async (data: Partial<Server>) => {
    if (!serverId) return
    try {
      const updated = await serverService.update(serverId, data)
      setServer(updated)
      return updated
    } catch (err) {
      const apiError = handleError(err)
      throw new Error(apiError.message)
    }
  }, [serverId, handleError])

  const remove = useCallback(async () => {
    if (!serverId) return
    try {
      await serverService.delete(serverId)
      return true
    } catch (err) {
      const apiError = handleError(err)
      throw new Error(apiError.message)
    }
  }, [serverId, handleError])

  return {
    server,
    loading,
    error,
    refetch: fetchServer,
    update,
    delete: remove,
  }
}
