import { useState, useEffect, useCallback } from 'react'
import { portService } from '../services/portService'
import type { ServerPort } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'

export function useServerPorts(serverId: string | undefined) {
  const [ports, setPorts] = useState<ServerPort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchPorts = useCallback(async () => {
    if (!serverId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await portService.getByServerId(serverId, {
        page: 1,
        perPage: 100,
        sort: '-created',
        expand: 'app',
      })

      setPorts(response.items)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [serverId, handleError])

  useEffect(() => {
    fetchPorts()
  }, [fetchPorts])

  return {
    ports,
    loading,
    error,
    refetch: fetchPorts,
  }
}
