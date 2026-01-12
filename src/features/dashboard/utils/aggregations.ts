import type { Ticket, TicketEvent, TicketStatus } from '@/features/tickets/types'
import type {
  TicketSnapshotMetrics,
  TicketTimelineMetrics,
  TicketsCreatedDataPoint,
  StatusTransitionDataPoint,
  Granularity,
  TicketStatusDonutChartData,
  TicketsCreatedOverTimeChartData,
  TicketStatusTransitionChartData,
} from '../types'
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '@/constants/tickets'

/**
 * Aggregate snapshot metrics from tickets collection
 */
export function aggregateSnapshotMetrics(tickets: Ticket[]): TicketSnapshotMetrics {
  const statusCounts = new Map<TicketStatus, number>()
  
  // Initialize all status counts to 0
  const allStatuses: TicketStatus[] = ['new', 'triage', 'waiting_dev', 'blocked', 'done', 'rejected']
  allStatuses.forEach((status) => statusCounts.set(status, 0))
  
  // Count tickets by status
  tickets.forEach((ticket) => {
    const current = statusCounts.get(ticket.status) || 0
    statusCounts.set(ticket.status, current + 1)
  })
  
  const total = tickets.length
  const open = 
    (statusCounts.get('new') || 0) +
    (statusCounts.get('triage') || 0) +
    (statusCounts.get('waiting_dev') || 0) +
    (statusCounts.get('blocked') || 0)
  const done = statusCounts.get('done') || 0
  const blocked = statusCounts.get('blocked') || 0
  const rejected = statusCounts.get('rejected') || 0
  
  const completionRate = total > 0 ? done / total : 0
  const closureRate = total > 0 ? (done + rejected) / total : 0
  
  const statusCountsArray = Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
  }))
  
  return {
    total,
    open,
    done,
    blocked,
    rejected,
    completionRate,
    closureRate,
    statusCounts: statusCountsArray,
  }
}

/**
 * Format date based on granularity
 */
function formatDateByGranularity(date: Date, granularity: Granularity): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  switch (granularity) {
    case 'day':
      return `${year}-${month}-${day}`
    case 'week':
      // Get week number (ISO week)
      const week = getWeekNumber(date)
      return `${year}-W${String(week).padStart(2, '0')}`
    case 'month':
      return `${year}-${month}`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Aggregate tickets created over time
 */
export function aggregateTicketsCreatedOverTime(
  tickets: Ticket[],
  granularity: Granularity
): TicketsCreatedOverTimeChartData[] {
  const buckets = new Map<string, number>()
  
  tickets.forEach((ticket) => {
    if (!ticket.created) return
    const date = new Date(ticket.created)
    const bucket = formatDateByGranularity(date, granularity)
    const current = buckets.get(bucket) || 0
    buckets.set(bucket, current + 1)
  })
  
  // Convert to array and sort by date
  return Array.from(buckets.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Aggregate status transitions from ticket_events
 * Only processes status_changed events
 */
export function aggregateStatusTransitions(
  events: TicketEvent[],
  granularity: Granularity
): StatusTransitionDataPoint[] {
  const buckets = new Map<string, Map<TicketStatus, number>>()
  
  // Filter only status_changed events
  const statusChangedEvents = events.filter(
    (event) => event.event_type === 'status_changed' && event.to_value
  )
  
  statusChangedEvents.forEach((event) => {
    if (!event.created || !event.to_value) return
    
    const toStatus = event.to_value as TicketStatus
    const date = new Date(event.created)
    const bucket = formatDateByGranularity(date, granularity)
    
    if (!buckets.has(bucket)) {
      buckets.set(bucket, new Map<TicketStatus, number>())
    }
    
    const statusMap = buckets.get(bucket)!
    const current = statusMap.get(toStatus) || 0
    statusMap.set(toStatus, current + 1)
  })
  
  // Flatten to array of data points
  const dataPoints: StatusTransitionDataPoint[] = []
  buckets.forEach((statusMap, date) => {
    statusMap.forEach((count, status) => {
      dataPoints.push({ date, status, count })
    })
  })
  
  // Sort by date
  return dataPoints.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Convert snapshot metrics to donut chart data
 */
export function convertToDonutChartData(
  snapshotMetrics: TicketSnapshotMetrics
): TicketStatusDonutChartData[] {
  return snapshotMetrics.statusCounts
    .filter((item) => item.count > 0) // Only show statuses with tickets
    .map((item) => ({
      status: item.status,
      count: item.count,
      label: TICKET_STATUS_LABELS[item.status] || item.status,
      color: getStatusColorForChart(item.status),
    }))
}

/**
 * Get color for chart based on status
 * Ensures each status has a unique color
 */
function getStatusColorForChart(status: TicketStatus): string {
  const colorMap: Record<TicketStatus, string> = {
    new: '#3b82f6', // blue
    triage: '#6b7280', // gray
    in_progress: '#f59e0b', // amber/orange
    waiting_dev: '#9ca3af', // gray-light
    blocked: '#f97316', // orange-red (distinct from rejected)
    done: '#10b981', // green
    rejected: '#991b1b', // dark red/maroon (distinct from blocked)
  }
  // Fallback: generate a color based on status string hash if not in map
  if (colorMap[status]) {
    return colorMap[status]
  }
  // Generate a consistent color from status string
  let hash = 0
  for (let i = 0; i < status.length; i++) {
    hash = status.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Convert status transitions to chart data format
 * Groups by date with status as keys
 */
export function convertStatusTransitionsToChartData(
  transitions: StatusTransitionDataPoint[]
): TicketStatusTransitionChartData[] {
  const dateMap = new Map<string, Record<string, number>>()
  
  // Group by date
  transitions.forEach((point) => {
    if (!dateMap.has(point.date)) {
      dateMap.set(point.date, {})
    }
    const dateData = dateMap.get(point.date)!
    dateData[point.status] = point.count
  })
  
  // Convert to array format
  return Array.from(dateMap.entries()).map(([date, statusCounts]) => ({
    date,
    ...statusCounts,
  }))
}
