import { useState, useEffect, useCallback } from 'react'
import { listEvents } from '../services/events.service'
import type { TicketEvent } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'

interface UseTicketEventsOptions {
  ticketId?: string
}

export function useTicketEvents(options: UseTicketEventsOptions = {}) {
  const { ticketId } = options
  const [events, setEvents] = useState<TicketEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchEvents = useCallback(async () => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const items = await listEvents(ticketId)
      setEvents(items)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [ticketId, handleError])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  }
}

