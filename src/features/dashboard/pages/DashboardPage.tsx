import { Card, CardBody, Input, Select, SelectItem, Button, Chip, Spinner } from '@heroui/react'
import { PageContainer } from '@/components/PageContainer'
import { useTicketDashboardFilters } from '../hooks/useTicketDashboardFilters'
import { useDashboard } from '../hooks/useDashboard'
import { TicketStatusDonutChart } from '../components/TicketStatusDonutChart'
import { TicketsCreatedOverTimeChart } from '../components/TicketsCreatedOverTimeChart'
import { TicketStatusTransitionChart } from '../components/TicketStatusTransitionChart'
import { EmptyState } from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const { filters, setDateRange, setGranularity } = useTicketDashboardFilters()
  const {
    snapshotMetrics,
    donutChartData,
    ticketsCreatedChartData,
    statusTransitionChartData,
    loading,
    error,
  } = useDashboard(filters)

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null
    if (date) {
      setDateRange({ ...filters.dateRange, from: date })
    }
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null
    if (date) {
      setDateRange({ ...filters.dateRange, to: date })
    }
  }

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <PageContainer className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Ticket Dashboard</h1>
        <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Operational Visibility & Analytics</p>
      </div>

      {/* Filters */}
      <Card shadow="none" className="border border-divider bg-content1">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              label="From Date"
              value={formatDateForInput(filters.dateRange.from)}
              onChange={handleFromDateChange}
              size="sm"
            />
            <Input
              type="date"
              label="To Date"
              value={formatDateForInput(filters.dateRange.to)}
              onChange={handleToDateChange}
              size="sm"
            />
            <Select
              label="Granularity"
              selectedKeys={new Set([filters.granularity])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as 'day' | 'week' | 'month'
                if (value) setGranularity(value)
              }}
              size="sm"
            >
              <SelectItem key="day">Day</SelectItem>
              <SelectItem key="week">Week</SelectItem>
              <SelectItem key="month">Month</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Error State */}
      {error && (
        <Card shadow="none" className="border border-danger bg-danger-50 dark:bg-danger-900/20">
          <CardBody className="p-6">
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* KPI Cards */}
      {!loading && snapshotMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card shadow="none" className="border border-divider bg-content1">
            <CardBody className="p-6">
              <div className="space-y-1">
                <p className="text-sm text-default-500">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">{snapshotMetrics.total}</p>
              </div>
            </CardBody>
          </Card>
          <Card shadow="none" className="border border-divider bg-content1">
            <CardBody className="p-6">
              <div className="space-y-1">
                <p className="text-sm text-default-500">Open Tickets</p>
                <p className="text-2xl font-bold text-foreground">{snapshotMetrics.open}</p>
              </div>
            </CardBody>
          </Card>
          <Card shadow="none" className="border border-divider bg-content1">
            <CardBody className="p-6">
              <div className="space-y-1">
                <p className="text-sm text-default-500">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {(snapshotMetrics.completionRate * 100).toFixed(1)}%
                </p>
              </div>
            </CardBody>
          </Card>
          <Card shadow="none" className="border border-divider bg-content1">
            <CardBody className="p-6">
              <div className="space-y-1">
                <p className="text-sm text-default-500">Blocked Tickets</p>
                <p className="text-2xl font-bold text-foreground">{snapshotMetrics.blocked}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Charts */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketStatusDonutChart data={donutChartData} />
          <TicketsCreatedOverTimeChart data={ticketsCreatedChartData} />
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6">
          <TicketStatusTransitionChart data={statusTransitionChartData} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && snapshotMetrics && snapshotMetrics.total === 0 && (
        <Card shadow="none" className="border border-divider bg-content1">
          <CardBody className="p-12">
            <EmptyState
              title="No tickets found"
              description="No tickets match the selected date range. Try adjusting your filters."
            />
          </CardBody>
        </Card>
      )}
    </PageContainer>
  )
}
