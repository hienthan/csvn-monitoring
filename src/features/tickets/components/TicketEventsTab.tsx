import { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Chip,
  Select,
  SelectItem,
  Divider,
} from '@heroui/react'
import { useTicketEvents } from '../hooks/useTicketEvents'
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
  getTicketEventTypeColor,
} from '../constants'
import type { TicketEventType } from '../types'
import { EmptyState } from '@/components/ui/EmptyState'

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
  }): { label: string; changedFields?: string[] } => {
    if (!event.event_type) {
      // Check if it's a ticket_updated event (note contains "ticket_updated:")
      if (event.note?.includes('ticket_updated:')) {
        const changedFields = event.note
          .replace('ticket_updated:', '')
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)
        return { label: 'Ticket updated', changedFields }
      }
      return { label: event.note || 'N/A' }
    }

    switch (event.event_type) {
      case 'status_changed':
        return {
          label: `${TICKET_STATUS_LABELS[event.from_value as keyof typeof TICKET_STATUS_LABELS] || event.from_value || 'N/A'} → ${TICKET_STATUS_LABELS[event.to_value as keyof typeof TICKET_STATUS_LABELS] || event.to_value || 'N/A'}`,
        }
      case 'priority_changed':
        return {
          label: `${TICKET_PRIORITY_LABELS[event.from_value as keyof typeof TICKET_PRIORITY_LABELS] || event.from_value || 'N/A'} → ${TICKET_PRIORITY_LABELS[event.to_value as keyof typeof TICKET_PRIORITY_LABELS] || event.to_value || 'N/A'}`,
        }
      case 'type_changed':
        return {
          label: `${TICKET_TYPE_LABELS[event.from_value as keyof typeof TICKET_TYPE_LABELS] || event.from_value || 'N/A'} → ${TICKET_TYPE_LABELS[event.to_value as keyof typeof TICKET_TYPE_LABELS] || event.to_value || 'N/A'}`,
        }
      case 'assigned':
        return { label: `Assigned to ${event.to_value || 'N/A'}` }
      case 'unassigned':
        return { label: 'Unassigned' }
      case 'note':
        // Check if note contains ticket_updated
        if (event.note?.includes('ticket_updated:')) {
          const changedFields = event.note
            .replace('ticket_updated:', '')
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean)
          return { label: 'Ticket updated', changedFields }
        }
        return { label: event.note || 'Note' }
      default:
        return { label: event.note || 'N/A' }
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
                <Skeleton className="h-4 w-32 rounded bg-content1" />
                <Skeleton className="h-16 w-full rounded bg-content1" />
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
          <div className="space-y-4">
            {filteredEvents.map((event, index) => {
              const change = getHumanReadableChange(event)
              const eventType = event.event_type || 'note'
              
              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredEvents.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-default-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center border-2 border-background">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {eventType !== 'note' && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color={getTicketEventTypeColor(eventType) as any}
                            >
                              {eventType.replace('_', ' ')}
                            </Chip>
                          )}
                          <span className="text-xs text-default-500">
                            {formatDate(event.created)}
                          </span>
                        </div>
                        <span className="text-sm text-default-700 font-medium">
                          {event.actor_name || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-default-900 font-medium">
                          {change.label}
                        </p>
                        
                        {/* Changed fields as Chip list */}
                        {change.changedFields && change.changedFields.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {change.changedFields.map((field, idx) => (
                              <Chip
                                key={idx}
                                size="sm"
                                variant="flat"
                                color="default"
                              >
                                {field}
                              </Chip>
                            ))}
                          </div>
                        )}
                        
                        {/* Note if exists and not already shown */}
                        {event.note && 
                         !event.note.includes('ticket_updated:') && 
                         eventType === 'note' && (
                          <p className="text-sm text-default-600">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < filteredEvents.length - 1 && <Divider className="mt-4" />}
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default TicketEventsTab
