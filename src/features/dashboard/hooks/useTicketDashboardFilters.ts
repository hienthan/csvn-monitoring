import { useState, useCallback } from 'react'
import type { TicketDashboardFilters, Granularity, DateRange } from '../types'

const DEFAULT_DATE_RANGE_DAYS = 30

function getDefaultDateRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - DEFAULT_DATE_RANGE_DAYS)
  return { from, to }
}

export function useTicketDashboardFilters() {
  const [filters, setFilters] = useState<TicketDashboardFilters>({
    dateRange: getDefaultDateRange(),
    granularity: 'day',
  })

  const setDateRange = useCallback((dateRange: DateRange) => {
    setFilters((prev) => ({ ...prev, dateRange }))
  }, [])

  const setGranularity = useCallback((granularity: Granularity) => {
    setFilters((prev) => ({ ...prev, granularity }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: getDefaultDateRange(),
      granularity: 'day',
    })
  }, [])

  return {
    filters,
    setDateRange,
    setGranularity,
    resetFilters,
  }
}
