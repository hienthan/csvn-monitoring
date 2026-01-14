import { Card, CardBody, CardHeader } from '@heroui/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useChartTheme } from '../hooks/useChartTheme'

interface TopProblematicServersProps {
  data: {
    cpu: { name: string, value: number }[]
    ram: { name: string, value: number }[]
  }
}

export function TopProblematicServers({ data }: TopProblematicServersProps) {
  const theme = useChartTheme()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top CPU */}
      <Card shadow="none" className="border border-divider bg-content1">
        <CardHeader className="flex flex-col items-start px-6 pt-6">
          <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Top 5 Resource Consumers</p>
          <h3 className="text-xl font-bold">CPU Intensity (%)</h3>
        </CardHeader>
        <CardBody className="px-3 pb-6 overflow-hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.cpu} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.grid} />
              <XAxis type="number" domain={[0, 100]} stroke={theme.muted} fontSize={10} />
              <YAxis dataKey="name" type="category" stroke={theme.muted} fontSize={10} width={100} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {data.cpu.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#f31260' : entry.value > 50 ? '#f5a623' : '#006fee'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Top RAM */}
      <Card shadow="none" className="border border-divider bg-content1">
        <CardHeader className="flex flex-col items-start px-6 pt-6">
          <p className="text-xs font-bold text-default-400 uppercase tracking-widest">Top 5 Resource Consumers</p>
          <h3 className="text-xl font-bold">Memory Utilization (%)</h3>
        </CardHeader>
        <CardBody className="px-3 pb-6 overflow-hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ram} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.grid} />
              <XAxis type="number" domain={[0, 100]} stroke={theme.muted} fontSize={10} />
              <YAxis dataKey="name" type="category" stroke={theme.muted} fontSize={10} width={100} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: '8px', pointerEvents: 'none' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {data.ram.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 85 ? '#f31260' : entry.value > 70 ? '#f5a623' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  )
}
