import { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
} from '@heroui/react'
import { useTicketEvents } from '../hooks/useTicketEvents'
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
  getTicketEventTypeColor,
} from '../constants'
import type { TicketEventType } from '../types'
import { EmptyState } from '@/components/EmptyState'

interface TicketEventsTabProps {
  ticketId?: string
}

function TicketEventsTab({ ticketId }: TicketEventsTabProps) {
  const { events, loading, error } = useTicketEvents({ ticketId })
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  const getHumanReadableChange = (event: {
    event_type?: TicketEventType
    from_value?: string
    to_value?: string
    note?: string
  }): string => {
    if (!event.event_type) return event.note || 'N/A'

    switch (event.event_type) {
      case 'status_changed':
        return `Status: ${TICKET_STATUS_LABELS[event.from_value as keyof typeof TICKET_STATUS_LABELS] || event.from_value || 'N/A'} → ${TICKET_STATUS_LABELS[event.to_value as keyof typeof TICKET_STATUS_LABELS] || event.to_value || 'N/A'}`
      case 'priority_changed':
        return `Priority: ${TICKET_PRIORITY_LABELS[event.from_value as keyof typeof TICKET_PRIORITY_LABELS] || event.from_value || 'N/A'} → ${TICKET_PRIORITY_LABELS[event.to_value as keyof typeof TICKET_PRIORITY_LABELS] || event.to_value || 'N/A'}`
      case 'type_changed':
        return `Type: ${TICKET_TYPE_LABELS[event.from_value as keyof typeof TICKET_TYPE_LABELS] || event.from_value || 'N/A'} → ${TICKET_TYPE_LABELS[event.to_value as keyof typeof TICKET_TYPE_LABELS] || event.to_value || 'N/A'}`
      case 'assigned':
        return `Assigned to ${event.to_value || 'N/A'}`
      case 'unassigned':
        return 'Unassigned'
      case 'note':
        return event.note || 'Note'
      default:
        return event.note || 'N/A'
    }
  }

  const filteredEvents =
    eventTypeFilter === 'all'
      ? events
      : events.filter((event) => event.event_type === eventTypeFilter)

  const eventTypes: TicketEventType[] = [
    'status_changed',
    'priority_changed',
    'type_changed',
    'assigned',
    'unassigned',
    'note',
  ]

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">Error loading events: {error.message}</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events ({filteredEvents.length})</h2>
        <Select
          label="Filter by type"
          placeholder="All types"
          selectedKeys={new Set([eventTypeFilter])}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string
            setEventTypeFilter(value || 'all')
          }}
          className="w-48"
          size="sm"
        >
          {[
            <SelectItem key="all">All Types</SelectItem>,
            ...eventTypes.map((type) => (
              <SelectItem key={type}>{type.replace('_', ' ')}</SelectItem>
            )),
          ]}
        </Select>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title={
              eventTypeFilter === 'all'
                ? 'No events recorded'
                : 'No events of this type'
            }
            actionLabel={eventTypeFilter !== 'all' ? 'Show all events' : undefined}
            onAction={
              eventTypeFilter !== 'all'
                ? () => setEventTypeFilter('all')
                : undefined
            }
          />
        ) : (
          <Table
            aria-label="Events table"
            removeWrapper
            classNames={{
              base: 'min-h-[400px]',
              th: 'text-left text-xs font-semibold px-4 py-2',
              td: 'text-left text-sm px-4 py-2',
            }}
          >
            <TableHeader>
              <TableColumn>TIME</TableColumn>
              <TableColumn>EVENT TYPE</TableColumn>
              <TableColumn>ACTOR</TableColumn>
              <TableColumn>CHANGE</TableColumn>
              <TableColumn>NOTE</TableColumn>
            </TableHeader>
            <TableBody items={filteredEvents}>
              {(event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <span className="text-default-500 text-xs">
                      {formatDate(event.created)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {event.event_type && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getTicketEventTypeColor(event.event_type) as any}
                      >
                        {event.event_type.replace('_', ' ')}
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-default-700">
                      {event.actor_name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-default-700">
                      {getHumanReadableChange(event)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-default-500 text-xs">
                      {event.note || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  )
}

export default TicketEventsTab
