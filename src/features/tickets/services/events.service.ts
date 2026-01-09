import pb from '@/lib/pb'
import type { TicketEvent } from '../types'
import { normalizePbError } from '../utils'

const COLLECTION_NAME = 'ma_ticket_events'

/**
 * List events for a specific ticket (sorted by created asc)
 */
export async function listEvents(ticketId: string): Promise<TicketEvent[]> {
  try {
    const result = await pb
      .collection(COLLECTION_NAME)
      .getList<TicketEvent>(1, 500, {
        sort: 'created',
        filter: `ticket = "${ticketId}"`,
      })
    return result.items
  } catch (error) {
    console.error(`Error fetching events for ticket ${ticketId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Add a new event
 */
export async function addEvent(payload: Partial<TicketEvent>): Promise<TicketEvent> {
  try {
    const result = await pb.collection(COLLECTION_NAME).create<TicketEvent>(payload)
    return result
  } catch (error) {
    console.error('Error adding event:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

