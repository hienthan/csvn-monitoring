import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Chip, Spinner, Button } from '@heroui/react'
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react'
import { useInfrastructureDashboard } from '../hooks/useInfrastructureDashboard'
import { GlobalInfrastructureOverview } from './GlobalInfrastructureOverview'
import { TopProblematicServers } from './TopProblematicServers'
import { FocusServerAnalytics } from './FocusServerAnalytics'
import { EmptyState } from '@/components/ui/EmptyState'
import { Server as ServerIcon } from 'lucide-react'

export function InfrastructureTab() {
  const navigate = useNavigate()
  const {
    globalOverview,
    topProblematic,
    focusServer,
    allNetdataServers,
    setSelectedServerId,
    loading,
    serverStates
  } = useInfrastructureDashboard()

  if (loading && Object.keys(serverStates).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" color="primary" label="Connecting to infrastructure..." />
      </div>
    )
  }

  if (allNetdataServers.length === 0) {
    return (
      <Card shadow="none" className="border border-divider bg-content1">
        <CardBody className="p-12">
          <EmptyState
            title="No monitoring targets"
            description="No servers have Netdata monitoring enabled. Go to Server Settings to enable it."
            icon={ServerIcon}
          />
        </CardBody>
      </Card>
    )
  }

  const globalCritical = Object.values(serverStates).reduce((acc, s) => acc + (s.alarms?.critical || 0), 0)
  const globalWarning = Object.values(serverStates).reduce((acc, s) => acc + (s.alarms?.warning || 0), 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Alert Summary & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-content1/30 p-4 rounded-2xl border border-divider/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-default-400 uppercase tracking-widest">Global Alarms:</span>
            <Chip
              variant="flat"
              color={globalCritical > 0 ? 'danger' : 'default'}
              startContent={<AlertCircle size={14} />}
              className="font-bold h-7"
            >
              {globalCritical} Critical
            </Chip>
            <Chip
              variant="flat"
              color={globalWarning > 0 ? 'warning' : 'default'}
              startContent={<AlertTriangle size={14} />}
              className="font-bold h-7"
            >
              {globalWarning} Warning
            </Chip>
          </div>
          <div className="h-4 w-px bg-divider" />
          <div className="flex items-center gap-2 text-xs font-bold text-default-500">
             <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             <span>Refreshes every 15s</span>
          </div>
        </div>
        
        {globalCritical > 0 && (
           <Button 
             size="sm" 
             variant="light" 
             color="danger" 
             className="font-bold"
             onPress={() => navigate('/servers')}
           >
             View Problematic Servers
           </Button>
        )}
      </div>

      {/* A. Global Overview */}
      <section className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">Cluster Overview</h2>
          <span className="text-xs font-bold text-default-400 uppercase">24h History</span>
        </div>
        <GlobalInfrastructureOverview data={globalOverview} />
      </section>

      {/* B. Top Problematic */}
      <section className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">Heatmap Diagnostics</h2>
          <span className="text-xs font-bold text-default-400 uppercase">Current Snapshot</span>
        </div>
        <TopProblematicServers data={topProblematic} />
      </section>

      {/* C. Focus Server */}
      <section className="space-y-4 pt-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">Individual Node Analysis</h2>
          <span className="text-xs font-bold text-default-400 uppercase">Interactive Explorer</span>
        </div>
        <FocusServerAnalytics 
          server={focusServer} 
          servers={allNetdataServers} 
          onSelect={setSelectedServerId} 
        />
      </section>
    </div>
  )
}
