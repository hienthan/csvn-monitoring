import { Card, CardBody } from '@heroui/react'
import type { BackupSummary } from '../types'

interface BackupSummaryCardsProps {
  summary: BackupSummary
  onCardClick?: (key: keyof BackupSummary) => void
  activeFilter?: keyof BackupSummary | null
}

export function BackupSummaryCards({
  summary,
  onCardClick,
  activeFilter,
}: BackupSummaryCardsProps) {
  const cards = [
    {
      key: 'total' as const,
      label: 'Total Targets',
      value: summary.total,
      color: 'default' as const,
    },
    {
      key: 'healthy' as const,
      label: 'Healthy',
      value: summary.healthy,
      color: 'success' as const,
    },
    {
      key: 'overdue' as const,
      label: 'Overdue',
      value: summary.overdue,
      color: 'warning' as const,
    },
    {
      key: 'failed' as const,
      label: 'Failed',
      value: summary.failed,
      color: 'danger' as const,
    },
    {
      key: 'disabled' as const,
      label: 'Disabled',
      value: summary.disabled,
      color: 'default' as const,
    },
    {
      key: 'running' as const,
      label: 'Running',
      value: summary.running,
      color: 'primary' as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const isActive = activeFilter === card.key
        return (
          <Card
            key={card.key}
            shadow="none"
            className={`border border-divider bg-content1/50 cursor-pointer transition-all ${
              isActive ? 'ring-2 ring-primary' : ''
            }`}
            isPressable={!!onCardClick}
            onPress={() => onCardClick?.(card.key)}
          >
            <CardBody className="p-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-default-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    card.color === 'success'
                      ? 'text-success'
                      : card.color === 'warning'
                      ? 'text-warning'
                      : card.color === 'danger'
                      ? 'text-danger'
                      : card.color === 'primary'
                      ? 'text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
