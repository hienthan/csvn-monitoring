import { useOutletContext, useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, Button, Skeleton, Tooltip } from '@heroui/react'
import { Ticket, Database, Cpu, HardDrive, Globe, Zap, Package } from 'lucide-react'
import { NetdataKpis } from '../netdata.types'

function ServerOverviewPage() {
  const { serverId } = useParams()
  const navigate = useNavigate()
  const { netdata } = useOutletContext<{ netdata: NetdataKpis }>()
  const {
    status,
    isLoading,
    error,
    cpu,
    load,
    ram,
    swapUsed,
    swapFree,
    diskRead,
    diskWrite,
    netIn,
    netOut
  } = netdata

  const formatSpeed = (val: number | null) => {
    if (val === null || status === 'Offline') return { val: '—', unit: 'KB/s' }
    if (val >= 1024) return { val: (val / 1024).toFixed(1), unit: 'MB/s' }
    return { val: Math.round(val).toString(), unit: 'KB/s' }
  }

  const netInFmt = formatSpeed(netIn)
  const netOutFmt = formatSpeed(netOut)
  const ioReadFmt = formatSpeed(diskRead)
  const ioWriteFmt = formatSpeed(diskWrite)

  const isOffline = status === 'Offline'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4 flex justify-between items-start">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">CPU Usage</p>
            <Cpu size={14} className="text-default-300" />
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              {isLoading && cpu === null ? (
                <Skeleton className="h-8 w-16 rounded-lg bg-default-200" />
              ) : (
                <p className={`text-2xl font-bold ${isOffline ? 'text-default-300' : 'text-foreground'}`}>
                  {isOffline ? '—' : (cpu ?? '—')}
                </p>
              )}
              <p className="text-xs font-bold text-default-400">%</p>
            </div>
            <div className="flex items-center gap-1.5">
              <p className={`text-[10px] font-bold ${isOffline ? 'text-default-300' : 'text-success'}`}>
                {isOffline ? 'Unavailable' : 'Load: ' + (load?.toFixed(2) ?? '—')}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* RAM Card */}
        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4 flex justify-between items-start">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">RAM Usage</p>
            <Zap size={14} className="text-default-300" />
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              {isLoading && ram === null ? (
                <Skeleton className="h-8 w-16 rounded-lg bg-default-200" />
              ) : (
                <p className={`text-2xl font-bold ${isOffline ? 'text-default-300' : 'text-foreground'}`}>
                  {isOffline ? '—' : (ram ?? '—')}
                </p>
              )}
              <p className="text-xs font-bold text-default-400">%</p>
            </div>
            <Tooltip content={swapUsed === null ? "Swap not available" : `Free: ${swapFree} KB`}>
              <p className="text-[10px] text-default-400 font-bold cursor-help">
                {isOffline ? 'Connection error' : swapUsed === null ? 'Swap: —' : `Swap: ${swapUsed} KB`}
              </p>
            </Tooltip>
          </CardBody>
        </Card>

        {/* Disk I/O Card - Point 2: abs(writes) and plurals fixed in service */}
        <Tooltip content={error && isOffline ? error : null} delay={0}>
          <Card shadow="none" className="border-divider border bg-content1/50">
            <CardHeader className="pb-1 px-4 pt-4 flex justify-between items-start">
              <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">Disk I/O</p>
              <HardDrive size={14} className="text-default-300" />
            </CardHeader>
            <CardBody className="pt-0 px-4 pb-4">
              <div className="flex items-baseline gap-1">
                {isLoading && diskRead === null ? (
                  <Skeleton className="h-8 w-24 rounded-lg bg-default-200" />
                ) : (
                  <>
                    <p className={`text-2xl font-bold ${isOffline ? 'text-default-300' : 'text-foreground'}`}>
                      {ioReadFmt.val}
                    </p>
                    <p className="text-xs font-bold text-default-400">{ioReadFmt.unit}</p>
                  </>
                )}
              </div>
              <p className="text-[10px] text-warning font-bold flex items-center gap-1">
                <span className="opacity-70">Write:</span> {ioWriteFmt.val} {ioWriteFmt.unit}
              </p>
            </CardBody>
          </Card>
        </Tooltip>

        {/* Network Card */}
        <Card shadow="none" className="border-divider border bg-content1/50">
          <CardHeader className="pb-1 px-4 pt-4 flex justify-between items-start">
            <p className="text-[10px] uppercase font-black text-default-400 tracking-wider">Network Traffic</p>
            <Globe size={14} className="text-default-300" />
          </CardHeader>
          <CardBody className="pt-0 px-4 pb-4">
            <div className="flex items-baseline gap-1">
              {isLoading && netIn === null ? (
                <Skeleton className="h-8 w-24 rounded-lg bg-default-200" />
              ) : (
                <>
                  <p className={`text-2xl font-bold ${isOffline ? 'text-default-300' : 'text-foreground'}`}>
                    {netInFmt.val}
                  </p>
                  <p className="text-xs font-bold text-default-400">{netInFmt.unit}</p>
                </>
              )}
            </div>
            <p className="text-[10px] text-primary font-bold flex items-center gap-1">
              <span className="opacity-70">Out:</span> {netOutFmt.val} {netOutFmt.unit}
            </p>
          </CardBody>
        </Card>
      </div>


      {/* Quick Actions */}
      <Card shadow="none" className="border-divider border bg-content1/50">
        <CardHeader className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold tracking-tight">Quick Actions</h2>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-2">
          <div className="flex flex-wrap gap-3">
            <Button
              color="primary"
              variant="flat"
              startContent={<Package className="w-4 h-4" />}
              onPress={() => navigate(`/apps/new?server=${serverId}`)}
              className="font-bold"
            >
              Add Application
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<Ticket className="w-4 h-4" />}
              className="font-bold"
            >
              Add Ticket
            </Button>
            <Button
              color="default"
              variant="flat"
              startContent={<Database className="w-4 h-4" />}
              className="font-bold"
            >
              View Backup
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ServerOverviewPage


