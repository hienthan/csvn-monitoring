import { useState, useEffect, useCallback } from 'react'
import { listComments, addComment, updateComment, deleteComment } from '../services/comments.service'
import type { TicketComment } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'
import pb from '@/lib/pb'

interface UseTicketCommentsOptions {
  ticketId?: string
}

export function useTicketComments(options: UseTicketCommentsOptions = {}) {
  const { ticketId } = options
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { handleError } = useApiError()

  const fetchComments = useCallback(async () => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const items = await listComments(ticketId)
      setComments(items)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [ticketId, handleError])

  const addNewComment = useCallback(
    async (params: {
      author_name: string
      message: string
      attachmentsFiles?: File[]
    }) => {
      if (!ticketId) return

      try {
        setLoading(true)
        setError(null)
        const newComment = await addComment({
          ticket: ticketId,
          ...params,
        })
        setComments((prev) => [...prev, newComment])
        try {
          await pb.collection('ma_tickets').update(ticketId, {
            updated: new Date().toISOString(),
          })
        } catch (updateError) {
          console.warn('Unable to bump ticket updated timestamp:', updateError)
        }
        return newComment
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

  const updateExistingComment = useCallback(
    async (commentId: string, message: string) => {
      if (!ticketId) return
      try {
        setLoading(true)
        setError(null)
        const updated = await updateComment({ commentId, message })
        setComments((prev) => prev.map((item) => (item.id === commentId ? updated : item)))
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

  const deleteExistingComment = useCallback(
    async (commentId: string) => {
      if (!ticketId) return
      try {
        setLoading(true)
        setError(null)
        await deleteComment(commentId)
        setComments((prev) => prev.filter((item) => item.id !== commentId))
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
    fetchComments()
  }, [fetchComments])

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment: addNewComment,
    updateComment: updateExistingComment,
    deleteComment: deleteExistingComment,
  }
}
