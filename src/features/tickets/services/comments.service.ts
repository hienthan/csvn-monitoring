import pb from '@/lib/pb'
import type { TicketComment } from '../types'
import { addEvent } from './events.service'
import { normalizePbError } from '../utils'

const COLLECTION_NAME = 'ma_ticket_comments'

export interface AddCommentParams {
  ticket: string
  author_name: string
  message: string
  attachmentsFiles?: File[]
}

export interface UpdateCommentParams {
  commentId: string
  message: string
}

/**
 * List comments for a specific ticket (sorted by created asc)
 */
export async function listComments(ticketId: string): Promise<TicketComment[]> {
  try {
    const result = await pb
      .collection(COLLECTION_NAME)
      .getList<TicketComment>(1, 500, {
        sort: 'created',
        filter: `ticket = "${ticketId}"`,
      })
    return result.items
  } catch (error) {
    console.error(`Error fetching comments for ticket ${ticketId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Add a comment with optional file attachments
 * Also creates a ticket_event with event_type=note
 */
export async function addComment(params: AddCommentParams): Promise<TicketComment> {
  try {
    const { ticket, author_name, message, attachmentsFiles } = params

    let data: FormData | Partial<TicketComment>

    // If there are attachments, use FormData
    if (attachmentsFiles && attachmentsFiles.length > 0) {
      const formData = new FormData()
      formData.append('ticket', ticket)
      formData.append('author_name', author_name)
      formData.append('message', message)

      // Add attachments
      attachmentsFiles.forEach((file) => {
        formData.append('attachments', file)
      })
      
      data = formData
    } else {
      data = {
        ticket,
        author_name,
        message,
      }
    }

    // Create comment
    const comment = await pb.collection(COLLECTION_NAME).create<TicketComment>(data as any)

    // Create ticket_event with event_type=note
    await addEvent({
      ticket,
      event_type: 'note',
      actor_name: author_name,
      note: 'comment_added',
    })

    return comment
  } catch (error) {
    console.error('Error adding comment:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Delete a comment (optional - only if allowed)
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    await pb.collection(COLLECTION_NAME).delete(commentId)
    return true
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Update a comment message
 */
export async function updateComment(params: UpdateCommentParams): Promise<TicketComment> {
  try {
    const { commentId, message } = params
    const updated = await pb.collection(COLLECTION_NAME).update<TicketComment>(commentId, {
      message,
    })
    return updated
  } catch (error) {
    console.error(`Error updating comment ${params.commentId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}
