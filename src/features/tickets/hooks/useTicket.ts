import { useState, useEffect, useCallback } from 'react'
import { getTicket, updateTicket, changeStatus } from '../services/tickets.service'
import type { Ticket, TicketStatus } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'

export function useTicket(ticketId?: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await getTicket(ticketId)
      setTicket(result)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [ticketId, handleError])

  const update = useCallback(
    async (payload: Partial<Ticket>, attachmentsFiles?: File[]) => {
      if (!ticketId) return

      try {
        setLoading(true)
        setError(null)
        const updated = await updateTicket(ticketId, payload, attachmentsFiles)
        setTicket(updated)
        return updated
      } catch (err) {
        const apiError = handleError(err)
        setError(new Error(apiError.message))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [ticketId, handleError]
  )

  const changeTicketStatus = useCallback(
    async (toStatus: TicketStatus, actorName: string, note?: string) => {
      if (!ticketId) return

      try {
        setLoading(true)
        setError(null)
        const updated = await changeStatus(ticketId, toStatus, actorName, note)
        setTicket(updated)
        return updated
      } catch (err) {
        const apiError = handleError(err)
        setError(new Error(apiError.message))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [ticketId, handleError]
  )

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  return {
    ticket,
    loading,
    error,
    refetch: fetchTicket,
    update,
    changeStatus: changeTicketStatus,
  }
}
