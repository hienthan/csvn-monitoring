import { useState, useEffect, useCallback } from 'react'
import { backupService } from '../services/backupService'
import type { Backup } from '../types'

export function useBackupDetail(backupId: string | undefined) {
  const [backup, setBackup] = useState<Backup | null>(null)
  const [loading, setLoading] = useState(!!backupId)
  const [error, setError] = useState<Error | null>(null)

  const fetchBackup = useCallback(async () => {
    if (!backupId) {
      setBackup(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await backupService.getById(backupId)
      setBackup(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error('Error fetching backup:', err)
    } finally {
      setLoading(false)
    }
  }, [backupId])

  useEffect(() => {
    fetchBackup()
  }, [fetchBackup])

  const update = useCallback(
    async (payload: Partial<Backup>) => {
      if (!backupId) return

      try {
        setLoading(true)
        setError(null)
        const updated = await backupService.update(backupId, payload)
        setBackup(updated)
        return updated
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [backupId]
  )

  const refetch = useCallback(() => {
    return fetchBackup()
  }, [fetchBackup])

  return {
    backup,
    loading,
    error,
    update,
    refetch,
  }
}
