import { useState, useEffect, useCallback, useRef } from 'react'
import { listTickets } from '../services/tickets.service'
import type { Ticket } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'
import type { TicketFilters } from './useTicketFilters'

export function useTickets(filters: TicketFilters = {}) {
  const {
    q = '',
    status,
    priority,
    type,
    environment,
    assignee,
    requestor,
    page = 1,
  } = filters

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(page)
  const { handleError } = useApiError()

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Abort controller ref for cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchTickets = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setLoading(true)
      setError(null)

      const response = await listTickets({
        page: currentPage,
        perPage: 20,
        q: q.trim() || undefined,
        status,
        priority,
        type,
        environment,
        assignee,
        requestor,
      })

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return
      }

      setTickets(response.items)
      setTotalPages(response.totalPages)
      setTotalItems(response.totalItems)
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [q, currentPage, status, priority, type, environment, assignee, requestor, handleError])

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      fetchTickets()
    }, 400) // 400ms debounce

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchTickets])

  // Update current page when page filter changes
  useEffect(() => {
    setCurrentPage(page)
  }, [page])

  return {
    tickets,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage,
    setCurrentPage,
    refetch: fetchTickets,
  }
}
