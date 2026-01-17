import { useState, useEffect, useCallback, useRef } from 'react'
import { backupService } from '../services/backupService'
import type { Backup, BackupListParams } from '../types'

interface UseBackupsOptions extends Omit<BackupListParams, 'page'> {
  autoFetch?: boolean
}

export function useBackups(options: UseBackupsOptions = {}) {
  const { autoFetch = true, ...params } = options
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  // Use ref to store latest params without causing re-renders
  const paramsRef = useRef(params)
  paramsRef.current = params

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await backupService.list({
        ...paramsRef.current,
        page,
        perPage: paramsRef.current.perPage || 1000, // Get all for overview page
      })
      setBackups(result.items)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error('Error fetching backups:', err)
    } finally {
      setLoading(false)
    }
  }, [page]) // Only depend on page

  useEffect(() => {
    if (autoFetch) {
      fetchBackups()
    }
  }, [autoFetch, fetchBackups])

  const refetch = useCallback(() => {
    return fetchBackups()
  }, [fetchBackups])

  return {
    backups,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    setPage,
    refetch,
  }
}
