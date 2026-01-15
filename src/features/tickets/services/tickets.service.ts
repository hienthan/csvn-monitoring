import pb from '@/lib/pb'
import type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketType,
  TicketEnvironment,
} from '../types'
import { addEvent } from './events.service'
import { normalizePbError } from '../utils'

const COLLECTION_NAME = 'ma_tickets'

/**
 * Normalize service_tags to always be an array
 * Handles cases where it might be a string, null, undefined, or already an array
 */
function normalizeServiceTags(serviceTags: unknown): string[] {
  if (Array.isArray(serviceTags)) {
    return serviceTags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
  }
  if (typeof serviceTags === 'string' && serviceTags.trim().length > 0) {
    return [serviceTags.trim()]
  }
  return []
}

export interface ListTicketsParams {
  page?: number
  perPage?: number
  q?: string // search query
  status?: TicketStatus
  priority?: TicketPriority
  types?: TicketType
  environment?: TicketEnvironment
  assignee?: string
  requestor?: string
}

export interface ListTicketsResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: Ticket[]
}

/**
 * List tickets with filters and search
 */
export async function listTickets(
  params: ListTicketsParams = {}
): Promise<ListTicketsResponse> {
  try {
    const {
      page = 1,
      perPage = 50,
      q,
      status,
      priority,
      types,
      environment,
      assignee,
      requestor,
    } = params

    // Build filter
    const filterParts: string[] = []

    // Search query (title OR code OR app_name OR requestor_name)
    if (q && q.trim()) {
      const query = q.trim().replace(/"/g, '\\"')
      filterParts.push(
        `(title ~ "${query}" || code ~ "${query}" || app_name ~ "${query}" || requestor_name ~ "${query}")`
      )
    }

    // Status filter
    if (status) {
      filterParts.push(`status = "${status}"`)
    }

    // Priority filter
    if (priority) {
      filterParts.push(`priority = "${priority}"`)
    }

    // Types filter
    if (types) {
      filterParts.push(`types = "${types}"`)
    }

    // Environment filter
    if (environment) {
      filterParts.push(`environment = "${environment}"`)
    }

    // Assignee filter
    if (assignee) {
      filterParts.push(`assignee = "${assignee}"`)
    }

    // Requestor filter
    if (requestor && requestor.trim()) {
      const requestorQuery = requestor.trim().replace(/"/g, '\\"')
      filterParts.push(`requestor_name ~ "${requestorQuery}"`)
    }

    const filter = filterParts.length > 0 ? filterParts.join(' && ') : ''

    // Sort by updated desc (fallback created desc)
    const sort = '-updated,-created'

    const result = await pb.collection(COLLECTION_NAME).getList<Ticket>(page, perPage, {
      sort,
      filter,
    })

    // Normalize service_tags for all items
    const normalizedItems = result.items.map((item) => ({
      ...item,
      service_tags: normalizeServiceTags(item.service_tags),
    }))

    return {
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      items: normalizedItems,
    }
  } catch (error) {
    console.error('Error fetching tickets:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(ticketId: string): Promise<Ticket> {
  try {
    const result = await pb.collection(COLLECTION_NAME).getOne<Ticket>(ticketId)
    // Normalize service_tags to ensure it's always an array
    return {
      ...result,
      service_tags: normalizeServiceTags(result.service_tags),
    }
  } catch (error) {
    console.error(`Error fetching ticket ${ticketId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Create a new ticket with optional file attachments
 */
export async function createTicket(
  payload: Partial<Ticket>,
  attachmentsFiles?: File[]
): Promise<Ticket> {
  try {
    let data: FormData | Partial<Ticket>

    // If there are attachments, use FormData
    if (attachmentsFiles && attachmentsFiles.length > 0) {
      const formData = new FormData()
      
      // Add all fields to FormData
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'service_tags' && Array.isArray(value)) {
            // Handle array fields
            value.forEach((tag) => {
              formData.append(`${key}[]`, String(tag))
            })
          } else if (key === 'link' && typeof value === 'object') {
            // Handle links as JSON string
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, String(value))
          }
        }
      })

      // Add attachments
      attachmentsFiles.forEach((file) => {
        formData.append('attachments', file)
      })
      
      data = formData
    } else {
      data = payload
    }

    const result = await pb.collection(COLLECTION_NAME).create<Ticket>(data as any)
    // Normalize service_tags to ensure it's always an array
    return {
      ...result,
      service_tags: normalizeServiceTags(result.service_tags),
    }
  } catch (error) {
    console.error('Error creating ticket:', error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Update a ticket with optional file attachments
 */
export async function updateTicket(
  ticketId: string,
  payload: Partial<Ticket>,
  attachmentsFiles?: File[]
): Promise<Ticket> {
  try {
    let data: FormData | Partial<Ticket>

    // If there are attachments, use FormData
    if (attachmentsFiles && attachmentsFiles.length > 0) {
      const formData = new FormData()
      
      // Add all fields to FormData
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'service_tags' && Array.isArray(value)) {
            // Handle array fields
            value.forEach((tag) => {
              formData.append(`${key}[]`, String(tag))
            })
          } else if (key === 'link' && typeof value === 'object') {
            // Handle links as JSON string
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, String(value))
          }
        }
      })

      // Add attachments
      attachmentsFiles.forEach((file) => {
        formData.append('attachments', file)
      })
      
      data = formData
    } else {
      data = payload
    }

    const result = await pb.collection(COLLECTION_NAME).update<Ticket>(ticketId, data as any)
    // Normalize service_tags to ensure it's always an array
    return {
      ...result,
      service_tags: normalizeServiceTags(result.service_tags),
    }
  } catch (error) {
    console.error(`Error updating ticket ${ticketId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

/**
 * Change ticket status with automatic started_at/resolved_at handling
 * and create a status_changed event
 */
export async function changeStatus(
  ticketId: string,
  toStatus: TicketStatus,
  actorName: string,
  note?: string,
  clearResolvedAt?: boolean
): Promise<Ticket> {
  try {
    // Get current ticket to check old status
    const currentTicket = await getTicket(ticketId)
    const fromStatus = currentTicket.status

    // Prepare update payload
    const updatePayload: Partial<Ticket> = {
      status: toStatus,
    }

    // Set started_at if moving to in_progress and it's empty
    if (toStatus === 'in_progress' && !currentTicket.started_at) {
      updatePayload.started_at = new Date().toISOString()
    }

    // Set resolved_at if moving to done or rejected
    if ((toStatus === 'done' || toStatus === 'rejected') && !currentTicket.resolved_at) {
      updatePayload.resolved_at = new Date().toISOString()
    }

    // Clear resolved_at if requested (e.g., moving from done/rejected back to in_progress)
    if (clearResolvedAt) {
      updatePayload.resolved_at = undefined
    }

    // Update ticket
    const updatedTicket = await updateTicket(ticketId, updatePayload)

    // Create status_changed event
    await addEvent({
      ticket: ticketId,
      event_type: 'status_changed',
      from_value: fromStatus,
      to_value: toStatus,
      actor_name: actorName,
      note,
    })

    return updatedTicket
  } catch (error) {
    console.error(`Error changing status for ticket ${ticketId}:`, error)
    const normalized = normalizePbError(error)
    throw new Error(normalized.message)
  }
}

