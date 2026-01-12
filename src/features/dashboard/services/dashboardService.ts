import pb from '@/lib/pb'
import type { Ticket, TicketEvent } from '@/features/tickets/types'
import type { DateRange } from '../types'
import { normalizePbError } from '@/features/tickets/utils'

const TICKETS_COLLECTION = 'ma_tickets'
const TICKET_EVENTS_COLLECTION = 'ma_ticket_events'

/**
 * Fetch all tickets within date range (for snapshot metrics)
 */
export async function fetchTicketsForSnapshot(dateRange: DateRange): Promise<Ticket[]> {
  try {
    const fromDate = dateRange.from.toISOString()
    const toDate = dateRange.to.toISOString()
    
    // Filter by created date within range
    const filter = `created >= "${fromDate}" && created <= "${toDate}"`
    
    // Fetch all tickets (no pagination limit for dashboard aggregation)
    const result = await pb.collection(TICKETS_COLLECTION).getList<Ticket>(1, 5000, {
      filter,
      sort: 'created',
    })
    
    return result.items
  } catch (error) {
    console.error('Error fetching tickets for snapshot:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Fetch all ticket events within date range (for timeline metrics)
 */
export async function fetchTicketEventsForTimeline(dateRange: DateRange): Promise<TicketEvent[]> {
  try {
    const fromDate = dateRange.from.toISOString()
    const toDate = dateRange.to.toISOString()
    
    // Filter by created date within range
    const filter = `created >= "${fromDate}" && created <= "${toDate}"`
    
    // Fetch all events (no pagination limit for dashboard aggregation)
    const result = await pb.collection(TICKET_EVENTS_COLLECTION).getList<TicketEvent>(1, 10000, {
      filter,
      sort: 'created',
    })
    
    return result.items
  } catch (error) {
    console.error('Error fetching ticket events for timeline:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Fetch all tickets created within date range (for tickets created over time chart)
 */
export async function fetchTicketsCreatedOverTime(dateRange: DateRange): Promise<Ticket[]> {
  try {
    const fromDate = dateRange.from.toISOString()
    const toDate = dateRange.to.toISOString()
    
    // Filter by created date within range
    const filter = `created >= "${fromDate}" && created <= "${toDate}"`
    
    // Fetch all tickets
    const result = await pb.collection(TICKETS_COLLECTION).getList<Ticket>(1, 5000, {
      filter,
      sort: 'created',
    })
    
    return result.items
  } catch (error) {
    console.error('Error fetching tickets created over time:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}
