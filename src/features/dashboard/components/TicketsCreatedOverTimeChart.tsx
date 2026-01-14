import { Card, CardBody, CardHeader } from '@heroui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TicketsCreatedOverTimeChartData } from '../types'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChartTheme } from '../hooks/useChartTheme'

interface TicketsCreatedOverTimeChartProps {
  data: TicketsCreatedOverTimeChartData[]
  title?: string
}

export function TicketsCreatedOverTimeChart({
  data,
  title = 'Tickets Created Over Time',
}: TicketsCreatedOverTimeChartProps) {
  const theme = useChartTheme()

  if (data.length === 0) {
    return (
      <Card shadow="none" className="border border-divider bg-content1">
        <CardHeader className="pb-0 pt-6 px-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </CardHeader>
        <CardBody className="pt-4 px-6 pb-6">
          <EmptyState title="No ticket creation data available" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card shadow="none" className="border border-divider bg-content1">
      <CardHeader className="pb-0 pt-6 px-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardBody className="pt-4 px-6 pb-6" style={{ overflow: 'hidden' }}>
        <div className="relative" style={{ minHeight: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, bottom: 10, left: 20 }}
              style={{ color: theme.text }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} vertical={false} />
              <XAxis
                dataKey="date"
                type="category"
                tick={{ fill: theme.muted, fontSize: 12 }}
                axisLine={{ stroke: theme.border, strokeWidth: 1 }}
                tickLine={{ stroke: theme.border }}
                tickMargin={6}
                angle={0}
                textAnchor="middle"
                height={24}
                tickFormatter={(v) => String(v).slice(0, 10)}
              />
              <YAxis
                type="number"
                tick={{ fill: theme.muted, fontSize: 12 }}
                axisLine={{ stroke: theme.border, strokeWidth: 1 }}
                tickLine={{ stroke: theme.border }}
                tickMargin={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }}
                wrapperStyle={{ zIndex: 1000, outline: 'none' }}
              />
            <Legend wrapperStyle={{ color: theme.muted }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Tickets Created"
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
