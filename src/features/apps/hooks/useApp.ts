import { useState, useEffect, useCallback } from 'react'
import { appService } from '../services/appService'
import type { ServerApp } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'

export function useApp(appId: string | undefined) {
  const [app, setApp] = useState<ServerApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchApp = useCallback(async () => {
    if (!appId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await appService.getById(appId, 'server')
      setApp(data)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [appId, handleError])

  useEffect(() => {
    fetchApp()
  }, [fetchApp])

  const update = useCallback(async (data: Partial<ServerApp>) => {
    if (!appId) return
    try {
      const updated = await appService.update(appId, data)
      setApp(updated)
      return updated
    } catch (err) {
      const apiError = handleError(err)
      throw new Error(apiError.message)
    }
  }, [appId, handleError])

  const remove = useCallback(async () => {
    if (!appId) return
    try {
      await appService.delete(appId)
      return true
    } catch (err) {
      const apiError = handleError(err)
      throw new Error(apiError.message)
    }
  }, [appId, handleError])

  return {
    app,
    loading,
    error,
    refetch: fetchApp,
    update,
    delete: remove,
  }
}
