import { Card, CardBody, CardHeader, Select, SelectItem, Chip, Button } from '@heroui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useChartTheme } from '../hooks/useChartTheme'
import { ServerNetdataState } from '../hooks/useInfrastructureDashboard'
import { Server as ServerIcon, Activity, Database, Globe, HardDrive } from 'lucide-react'
import { calculateCpuUsage, calculateRamUsagePercent } from '@/features/servers/services/netdataService'

interface FocusServerAnalyticsProps {
  server: ServerNetdataState | null
  servers: any[]
  onSelect: (id: string) => void
}

export function FocusServerAnalytics({ server, servers, onSelect }: FocusServerAnalyticsProps) {
  const theme = useChartTheme()

  if (!server) return null

  const formatTime = (time: number) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const cpuData = server.history['system.cpu']?.map(p => ({
    time: p.time,
    value: calculateCpuUsage(p)
  }))

  const ramData = server.history['system.ram']?.map(p => ({
    time: p.time,
    percent: calculateRamUsagePercent(p)
  }))

  const netData = server.history['system.net']?.map(p => ({
    time: p.time,
    received: p.received || 0,
    sent: p.sent || 0
  }))

  const ioData = server.history['system.io']?.map(p => ({
    time: p.time,
    reads: p.reads || 0,
    writes: p.writes || 0
  }))

  const swapData = server.history['mem.swap']?.map(p => ({
    time: p.time,
    used: p.used || 0
  }))

  const hasSwap = swapData && swapData.some(d => d.used > 0)

  return (
    <div className="space-y-6">
      <Card shadow="none" className="border border-divider bg-content1/50">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ServerIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{server.name}</h3>
                  <div className="flex gap-1">
                    {server.alarms.critical > 0 && (
                      <Chip size="sm" color="danger" variant="flat" className="h-5 px-1 font-bold">
                        {server.alarms.critical}
                      </Chip>
                    )}
                    {server.alarms.warning > 0 && (
                      <Chip size="sm" color="warning" variant="flat" className="h-5 px-1 font-bold">
                        {server.alarms.warning}
                      </Chip>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-default-400 font-mono">{server.ip}</p>
                  <Button 
                    size="sm" 
                    variant="light" 
                    className="h-6 px-2 text-[10px] font-bold uppercase min-w-0"
                    onPress={() => window.location.href = `/servers/${server.serverId}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <Select
                label="Explore Server"
                placeholder="Select a server"
                size="sm"
                selectedKeys={new Set([server.serverId])}
                onSelectionChange={(keys) => {
                  const id = Array.from(keys)[0] as string
                  if (id) onSelect(id)
                }}
              >
                {servers.map(s => (
                  <SelectItem key={s.id} textValue={s.name}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{s.name}</span>
                      <span className="text-xs text-default-400">{s.ip}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {!server.isReachable ? (
        <Card shadow="none" className="border border-divider bg-content1">
          <CardBody className="p-12 text-center">
             <div className="inline-flex p-4 rounded-full bg-danger/10 text-danger mb-4">
               <Activity size={32} />
             </div>
             <h3 className="text-lg font-bold">No Monitoring Data</h3>
             <p className="text-default-400">Netdata is unreachable on this server.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPU Line */}
          <Card shadow="none" className="border border-divider bg-content1">
            <CardHeader className="flex items-center gap-2 px-6 pt-6">
               <Activity size={18} className="text-primary" />
               <h3 className="font-bold">CPU Utilization (%)</h3>
            </CardHeader>
            <CardBody className="px-3 pb-6 overflow-hidden">
               <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <YAxis domain={[0, 100]} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                    <Area type="monotone" dataKey="value" stroke="#006fee" fill="#006fee" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Memory Stacked */}
          <Card shadow="none" className="border border-divider bg-content1">
            <CardHeader className="flex items-center gap-2 px-6 pt-6">
               <Database size={18} className="text-secondary" />
               <h3 className="font-bold">Memory Usage (%)</h3>
            </CardHeader>
            <CardBody className="px-3 pb-6 overflow-hidden">
               <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ramData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <YAxis domain={[0, 100]} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                    <Area type="monotone" dataKey="percent" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Network */}
          <Card shadow="none" className="border border-divider bg-content1">
            <CardHeader className="flex items-center gap-2 px-6 pt-6">
               <Globe size={18} className="text-success" />
               <h3 className="font-bold">Bandwidth (Kbps)</h3>
            </CardHeader>
            <CardBody className="px-3 pb-6 overflow-hidden">
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={netData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                    <Line type="monotone" dataKey="received" name="Received" stroke="#17c964" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="sent" name="Sent" stroke="#f5a623" dot={false} strokeWidth={2} />
                  </LineChart>
               </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Disk */}
          <Card shadow="none" className="border border-divider bg-content1">
            <CardHeader className="flex items-center gap-2 px-6 pt-6">
               <HardDrive size={18} className="text-danger" />
               <h3 className="font-bold">Disk I/O (Kbps)</h3>
            </CardHeader>
            <CardBody className="px-3 pb-6 overflow-hidden">
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ioData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                    <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                    <Line type="monotone" dataKey="reads" name="Reads" stroke="#06b6d4" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="writes" name="Writes" stroke="#f31260" dot={false} strokeWidth={2} />
                  </LineChart>
               </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Swap */}
          {hasSwap ? (
            <Card shadow="none" className="border border-divider bg-content1 md:col-span-2">
              <CardHeader className="flex items-center gap-2 px-6 pt-6">
                 <Database size={18} className="text-warning" />
                 <h3 className="font-bold">Swap Usage (KB)</h3>
              </CardHeader>
              <CardBody className="px-3 pb-6 overflow-hidden">
                 <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={swapData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                      <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                      <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                      <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                      <Area type="monotone" dataKey="used" stroke="#f5a623" fill="#f5a623" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </CardBody>
            </Card>
          ) : (
            <Card shadow="none" className="border border-divider bg-content1/30 md:col-span-2">
               <CardBody className="p-6 text-center text-default-400 text-sm italic">
                  Swap not used on this system
               </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
