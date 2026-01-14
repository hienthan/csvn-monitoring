import { Card, CardBody, CardHeader } from '@heroui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useChartTheme } from '../hooks/useChartTheme'

interface GlobalInfrastructureOverviewProps {
  data: any
}

export function GlobalInfrastructureOverview({ data }: GlobalInfrastructureOverviewProps) {
  const theme = useChartTheme()

  if (!data) return null

  const formatTime = (time: number) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avg CPU */}
        <Card shadow="none" className="border border-divider bg-content1">
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Avg CPU Usage (%)</p>
            <h3 className="text-xl font-bold">Cluster Average</h3>
          </CardHeader>
          <CardBody className="px-3 pb-6 overflow-hidden">
             <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.cpu}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006fee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#006fee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime} 
                    stroke={theme.muted} 
                    fontSize={10}
                    tick={{ fill: theme.muted }}
                  />
                  <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={formatTime}
                    contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#006fee" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Avg RAM */}
        <Card shadow="none" className="border border-divider bg-content1">
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Avg RAM Usage (%)</p>
            <h3 className="text-xl font-bold">Memory Health</h3>
          </CardHeader>
          <CardBody className="px-3 pb-6 overflow-hidden">
             <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.ram}>
                  <defs>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                  <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                  <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} domain={[0, 100]} />
                  <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Total Network */}
        <Card shadow="none" className="border border-divider bg-content1">
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Total Network (Kbps)</p>
            <h3 className="text-xl font-bold">Cluster Traffic</h3>
          </CardHeader>
          <CardBody className="px-3 pb-6 overflow-hidden">
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.net}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                  <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                  <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                  <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                  <Line type="monotone" dataKey="value" name="In" stroke="#17c964" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="secondaryValue" name="Out" stroke="#f5a623" dot={false} strokeWidth={2} />
                </LineChart>
             </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Total Disk IO */}
        <Card shadow="none" className="border border-divider bg-content1">
          <CardHeader className="flex flex-col items-start px-6 pt-6">
            <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Total Disk I/O (Kbps)</p>
            <h3 className="text-xl font-bold">Storage Activity</h3>
          </CardHeader>
          <CardBody className="px-3 pb-6 overflow-hidden">
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.io}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
                  <XAxis dataKey="time" tickFormatter={formatTime} stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                  <YAxis stroke={theme.muted} fontSize={10} tick={{ fill: theme.muted }} />
                  <Tooltip labelFormatter={formatTime} contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }} wrapperStyle={{ outline: 'none' }} />
                  <Line type="monotone" dataKey="value" name="Read" stroke="#06b6d4" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="secondaryValue" name="Write" stroke="#f31260" dot={false} strokeWidth={2} />
                </LineChart>
             </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
