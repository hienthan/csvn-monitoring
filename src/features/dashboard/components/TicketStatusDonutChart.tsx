import { Card, CardBody, CardHeader } from '@heroui/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { TicketStatusDonutChartData } from '../types'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChartTheme } from '../hooks/useChartTheme'

interface TicketStatusDonutChartProps {
  data: TicketStatusDonutChartData[]
  title?: string
}

export function TicketStatusDonutChart({ data, title = 'Ticket Status Distribution' }: TicketStatusDonutChartProps) {
  const theme = useChartTheme()
  if (data.length === 0) {
    return (
      <Card shadow="none" className="border border-divider bg-content1">
        <CardHeader className="pb-0 pt-6 px-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </CardHeader>
        <CardBody className="pt-4 px-6 pb-6">
          <EmptyState title="No ticket data available" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card shadow="none" className="border border-divider bg-content1">
      <CardHeader className="pb-0 pt-6 px-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardBody className="pt-4 px-6 pb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(entry: any) => {
                const percent = entry.percent as number | undefined
                const label = (entry.label || entry.status || 'Unknown') as string
                if (percent === undefined || percent === null) return ''
                return `${label}: ${(percent * 100).toFixed(0)}%`
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="label"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => {
                if (value === undefined || value === null) return ['', 'Count']
                return [value, 'Count']
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any, payload?: any) => {
                if (payload && Array.isArray(payload) && payload[0]?.payload) {
                  return payload[0].payload.label || payload[0].payload.status || label
                }
                return label
              }}
              contentStyle={{
                backgroundColor: theme.surface,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
              }}
            />
            <Legend
              formatter={(value) => value}
              wrapperStyle={{ color: theme.muted }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
