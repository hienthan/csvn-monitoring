import { useState, useEffect, useCallback } from 'react'
import { serverService } from '../services/serverService'
import type { Server } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'

interface UseServersOptions {
  searchQuery?: string
}

export function useServers(options: UseServersOptions = {}) {
  const { searchQuery = '' } = options
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let filter = ''
      if (searchQuery.trim()) {
        // Search by name or host
        const query = searchQuery.trim()
        filter = `name ~ "${query}" || host ~ "${query}" || ip ~ "${query}"`
      }

      const response = await serverService.list({
        page: 1,
        perPage: 100,
        sort: '-updated',
        filter,
      })

      setServers(response.items)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, handleError])

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  return {
    servers,
    loading,
    error,
    refetch: fetchServers,
  }
}
