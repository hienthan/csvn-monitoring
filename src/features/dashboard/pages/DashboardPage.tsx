import { useState } from 'react'
import { Card, CardBody, Input, Select, SelectItem, Spinner, Tabs, Tab } from '@heroui/react'
import { PageContainer } from '@/components/PageContainer'
import { useTicketDashboardFilters } from '../hooks/useTicketDashboardFilters'
import { useDashboard } from '../hooks/useDashboard'
import { useServerDashboard } from '../hooks/useServerDashboard'
import { TicketStatusDonutChart } from '../components/TicketStatusDonutChart'
import { TicketsCreatedOverTimeChart } from '../components/TicketsCreatedOverTimeChart'
import { TicketStatusTransitionChart } from '../components/TicketStatusTransitionChart'
import { InfrastructureTab } from '../components/InfrastructureTab'
import { EmptyState } from '@/components/ui/EmptyState'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('operations')
  const { filters, setDateRange, setGranularity } = useTicketDashboardFilters()
  const {
    snapshotMetrics,
    donutChartData,
    ticketsCreatedChartData,
    statusTransitionChartData,
    loading: ticketsLoading,
    error: ticketsError,
  } = useDashboard(filters)

  const { metrics: serverMetrics, loading: serversLoading } = useServerDashboard()

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
    <PageContainer className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-2">
            <LayoutDashboard className="text-primary" size={28} />
            Command Center
          </h1>
          <p className="text-sm font-bold text-default-400 uppercase tracking-widest pl-1">
            Real-time Operational Visibility
          </p>
        </div>
      </div>

      {/* Global Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card shadow="none" className="border border-divider bg-content1 overflow-hidden group">
          <CardBody className="p-0">
             <div className="bg-primary/10 p-1 w-full h-1" />
             <div className="p-6 space-y-1">
                <p className="text-xs font-bold text-default-400 uppercase tracking-tighter">Open Tickets</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-foreground">
                    {ticketsLoading ? '...' : snapshotMetrics?.open || 0}
                  </p>
                  <p className="text-xs text-default-500">Active</p>
                </div>
             </div>
          </CardBody>
        </Card>
        
        <Card shadow="none" className="border border-divider bg-content1 overflow-hidden group">
          <CardBody className="p-0">
             <div className="bg-success/10 p-1 w-full h-1" />
             <div className="p-6 space-y-1">
                <p className="text-xs font-bold text-default-400 uppercase tracking-tighter">Online Servers</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-foreground">
                    {serversLoading ? '...' : serverMetrics?.online || 0}
                  </p>
                  <p className="text-xs text-default-500">Connected</p>
                </div>
             </div>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-divider bg-content1 overflow-hidden group">
          <CardBody className="p-0">
             <div className="bg-warning/10 p-1 w-full h-1" />
             <div className="p-6 space-y-1">
                <p className="text-xs font-bold text-default-400 uppercase tracking-tighter">Completion</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-foreground">
                    {ticketsLoading ? '...' : `${((snapshotMetrics?.completionRate || 0) * 100).toFixed(0)}%`}
                  </p>
                  <p className="text-xs text-default-500">Efficiency</p>
                </div>
             </div>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-divider bg-content1 overflow-hidden group">
          <CardBody className="p-0">
             <div className="bg-default-400/10 p-1 w-full h-1" />
             <div className="p-6 space-y-1">
                <p className="text-xs font-bold text-default-400 uppercase tracking-tighter">Total Assets</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-foreground">
                    {serversLoading ? '...' : serverMetrics?.total || 0}
                  </p>
                  <p className="text-xs text-default-500">Registered</p>
                </div>
             </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Tabs 
          aria-label="Dashboard views" 
          variant="underlined" 
          color="primary"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "gap-6 w-full relative rounded-none border-b border-divider p-0",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary font-bold uppercase tracking-widest text-xs"
          }}
        >
          <Tab 
            key="operations" 
            title={
              <div className="flex items-center gap-2 px-2">
                <span>Operations</span>
              </div>
            }
          >
            <div className="pt-6 space-y-6">
              {/* Filters for Tickets */}
              <Card shadow="none" className="border border-divider bg-content1/50 backdrop-blur-md">
                <CardBody className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="date"
                      label="From Date"
                      value={formatDateForInput(filters.dateRange.from)}
                      onChange={handleFromDateChange}
                      size="sm"
                      variant="flat"
                    />
                    <Input
                      type="date"
                      label="To Date"
                      value={formatDateForInput(filters.dateRange.to)}
                      onChange={handleToDateChange}
                      size="sm"
                      variant="flat"
                    />
                    <Select
                      label="Granularity"
                      selectedKeys={new Set([filters.granularity])}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as 'day' | 'week' | 'month'
                        if (value) setGranularity(value)
                      }}
                      size="sm"
                      variant="flat"
                    >
                      <SelectItem key="day">Day</SelectItem>
                      <SelectItem key="week">Week</SelectItem>
                      <SelectItem key="month">Month</SelectItem>
                    </Select>
                  </div>
                </CardBody>
              </Card>

              {ticketsError && (
                <Card shadow="none" className="border border-danger/20 bg-danger/5">
                  <CardBody className="p-4">
                    <p className="text-danger text-sm font-medium">{ticketsError}</p>
                  </CardBody>
                </Card>
              )}

              {ticketsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TicketStatusDonutChart data={donutChartData} />
                    <TicketsCreatedOverTimeChart data={ticketsCreatedChartData} />
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <TicketStatusTransitionChart data={statusTransitionChartData} />
                  </div>
                  {snapshotMetrics?.total === 0 && (
                     <Card shadow="none" className="border border-divider bg-content1">
                       <CardBody className="p-12 text-center">
                         <EmptyState
                           title="No ticket data for this range"
                           description="Adjust the filters to see historical trends."
                         />
                       </CardBody>
                     </Card>
                  )}
                </>
              )}
            </div>
          </Tab>
          <Tab 
            key="infrastructure" 
            title={
              <div className="flex items-center gap-2 px-2">
                <span>Infrastructure</span>
              </div>
            }
          >
            <div className="pt-6">
              <InfrastructureTab />
            </div>
          </Tab>
        </Tabs>
      </div>
    </PageContainer>
  )
}
