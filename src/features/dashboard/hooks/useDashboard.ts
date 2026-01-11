import { useState, useEffect } from 'react'
import {
  fetchTicketsForSnapshot,
  fetchTicketEventsForTimeline,
  fetchTicketsCreatedOverTime,
} from '../services/dashboardService'
import {
  aggregateSnapshotMetrics,
  aggregateTicketsCreatedOverTime,
  aggregateStatusTransitions,
  convertToDonutChartData,
  convertStatusTransitionsToChartData,
} from '../utils/aggregations'
import type { TicketDashboardFilters } from '../types'
import type {
  TicketStatusDonutChartData,
  TicketsCreatedOverTimeChartData,
  TicketStatusTransitionChartData,
} from '../types'
import type { TicketSnapshotMetrics } from '../types'

interface UseDashboardReturn {
  // Snapshot metrics
  snapshotMetrics: TicketSnapshotMetrics | null
  donutChartData: TicketStatusDonutChartData[]
  
  // Timeline metrics
  ticketsCreatedChartData: TicketsCreatedOverTimeChartData[]
  statusTransitionChartData: TicketStatusTransitionChartData[]
  
  // Loading and error states
  loading: boolean
  error: string | null
}

export function useDashboard(filters: TicketDashboardFilters): UseDashboardReturn {
  const [snapshotMetrics, setSnapshotMetrics] = useState<TicketSnapshotMetrics | null>(null)
  const [donutChartData, setDonutChartData] = useState<TicketStatusDonutChartData[]>([])
  const [ticketsCreatedChartData, setTicketsCreatedChartData] = useState<TicketsCreatedOverTimeChartData[]>([])
  const [statusTransitionChartData, setStatusTransitionChartData] = useState<TicketStatusTransitionChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch all data in parallel
        const [tickets, events, ticketsCreated] = await Promise.all([
          fetchTicketsForSnapshot(filters.dateRange),
          fetchTicketEventsForTimeline(filters.dateRange),
          fetchTicketsCreatedOverTime(filters.dateRange),
        ])

        // Aggregate snapshot metrics
        const snapshot = aggregateSnapshotMetrics(tickets)
        setSnapshotMetrics(snapshot)
        setDonutChartData(convertToDonutChartData(snapshot))

        // Aggregate timeline metrics
        const createdOverTime = aggregateTicketsCreatedOverTime(ticketsCreated, filters.granularity)
        setTicketsCreatedChartData(createdOverTime)

        const transitions = aggregateStatusTransitions(events, filters.granularity)
        setStatusTransitionChartData(convertStatusTransitionsToChartData(transitions))
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [filters])

  return {
    snapshotMetrics,
    donutChartData,
    ticketsCreatedChartData,
    statusTransitionChartData,
    loading,
    error,
  }
}
