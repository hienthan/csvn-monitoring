import { useSearchParams } from 'react-router-dom'
import { useMemo, useCallback } from 'react'
import type {
  TicketStatus,
  TicketPriority,
  TicketType,
  TicketEnvironment,
} from '../types'

export interface TicketFilters {
  q?: string
  status?: TicketStatus
  priority?: TicketPriority
  types?: TicketType
  environment?: TicketEnvironment
  assignee?: string
  page?: number
}

export function useTicketFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<TicketFilters>(() => {
    return {
      q: searchParams.get('q') || undefined,
      status: (searchParams.get('status') as TicketStatus) || undefined,
      priority: (searchParams.get('priority') as TicketPriority) || undefined,
      types: (searchParams.get('types') as TicketType) || undefined,
      environment: (searchParams.get('environment') as TicketEnvironment) || undefined,
      assignee: searchParams.get('assignee') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    }
  }, [searchParams])

  const setFilter = useCallback(
    (key: keyof TicketFilters, value: string | number | undefined) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        
        if (value === undefined || value === '' || value === null) {
          newParams.delete(key)
        } else {
          newParams.set(key, String(value))
        }
        
        // Reset to page 1 when filters change (except when setting page itself)
        if (key !== 'page') {
          newParams.set('page', '1')
        }
        
        return newParams
      })
    },
    [setSearchParams]
  )

  const setFilters = useCallback(
    (newFilters: Partial<TicketFilters>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === undefined || value === '' || value === null) {
            newParams.delete(key)
          } else {
            newParams.set(key, String(value))
          }
        })
        
        // Reset to page 1 when filters change (except when setting page itself)
        if (!('page' in newFilters)) {
          newParams.set('page', '1')
        }
        
        return newParams
      })
    },
    [setSearchParams]
  )

  const clearFilters = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
  }
}

