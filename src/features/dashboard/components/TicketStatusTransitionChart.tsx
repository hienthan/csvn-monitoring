import { Card, CardBody, CardHeader } from '@heroui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TicketStatusTransitionChartData } from '../types'
import { EmptyState } from '@/components/ui/EmptyState'
import { TICKET_STATUS_LABELS } from '@/constants/tickets'
import type { TicketStatus } from '@/features/tickets/types'
import { useChartTheme } from '../hooks/useChartTheme'

interface TicketStatusTransitionChartProps {
  data: TicketStatusTransitionChartData[]
  title?: string
}

// Color mapping for status lines (optimized for dark mode visibility)
const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6', // blue
  triage: '#9ca3af', // light gray (better visibility on dark)
  in_progress: '#f59e0b', // amber/orange
  waiting_dev: '#8b5cf6', // purple (better visibility on dark)
  blocked: '#f97316', // orange-red (distinct from rejected)
  done: '#10b981', // green
  rejected: '#991b1b', // dark red/maroon (distinct from blocked)
}

export function TicketStatusTransitionChart({
  data,
  title = 'Status Transitions Over Time',
}: TicketStatusTransitionChartProps) {
  const theme = useChartTheme()

  if (data.length === 0) {
    return (
      <Card shadow="none" className="border border-divider bg-content1">
        <CardHeader className="pb-0 pt-6 px-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </CardHeader>
        <CardBody className="pt-4 px-6 pb-6">
          <EmptyState title="No status transition data available" />
        </CardBody>
      </Card>
    )
  }

  // Extract all unique statuses from data
  const statuses = new Set<string>()
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'date' && typeof item[key] === 'number') {
        statuses.add(key)
      }
    })
  })

  const statusArray = Array.from(statuses) as TicketStatus[]

  return (
    <Card shadow="none" className="border border-divider bg-content1">
      <CardHeader className="pb-0 pt-6 px-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardBody className="pt-4 px-6 pb-6" style={{ overflow: 'hidden' }}>
        <div className="relative" style={{ minHeight: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height={300}>
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
            {statusArray.map((status) => (
              <Line
                key={status}
                type="monotone"
                dataKey={status}
                stroke={STATUS_COLORS[status] || '#6b7280'}
                strokeWidth={2}
                name={TICKET_STATUS_LABELS[status] || status}
                dot={{ fill: STATUS_COLORS[status] || '#6b7280', r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
