import { useState, useEffect, useCallback } from 'react'
import { appService } from '@/services/appService'
import type { ServerApp } from '@/types/app'
import { useApiError } from './useApiError'

export function useServerApps(serverId: string | undefined) {
  const [apps, setApps] = useState<ServerApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchApps = useCallback(async () => {
    if (!serverId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await appService.getByServerId(serverId, {
        page: 1,
        perPage: 100,
        sort: '-created',
      })

      setApps(response.items)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [serverId, handleError])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  return {
    apps,
    loading,
    error,
    refetch: fetchApps,
  }
}

