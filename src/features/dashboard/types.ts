import type { TicketStatus } from '@/features/tickets/types'

// Dashboard Filters
export type Granularity = 'day' | 'week' | 'month'

export interface DateRange {
  from: Date
  to: Date
}

export interface TicketDashboardFilters {
  dateRange: DateRange
  granularity: Granularity
}

// Snapshot Metrics (from tickets collection)
export interface TicketStatusCount {
  status: TicketStatus
  count: number
}

export interface TicketSnapshotMetrics {
  total: number
  open: number
  done: number
  blocked: number
  rejected: number
  completionRate: number
  closureRate: number
  statusCounts: TicketStatusCount[]
}

// Timeline Metrics (from ticket_events collection)
export interface TicketsCreatedDataPoint {
  date: string // ISO date string
  count: number
}

export interface StatusTransitionDataPoint {
  date: string // ISO date string
  status: TicketStatus
  count: number
}

export interface TicketTimelineMetrics {
  ticketsCreated: TicketsCreatedDataPoint[]
  statusTransitions: StatusTransitionDataPoint[]
}

// Chart Data Props
export interface TicketStatusDonutChartData {
  status: TicketStatus
  count: number
  label: string
  color: string
}

export interface TicketsCreatedOverTimeChartData {
  date: string
  count: number
}

export interface TicketStatusTransitionChartData {
  date: string
  [status: string]: string | number // Dynamic status keys with counts
}
