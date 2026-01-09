import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Chip,
} from '@heroui/react'
import { useTicketEvents } from '../hooks/useTicketEvents'

interface TicketEventsTabProps {
  ticketId?: string
}

function TicketEventsTab({ ticketId }: TicketEventsTabProps) {
  const { events, loading, error } = useTicketEvents({ ticketId })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  const getEventTypeColor = (eventType?: string) => {
    const typeLower = eventType?.toLowerCase() || 'unknown'
    if (typeLower === 'created' || typeLower === 'open') {
      return 'primary'
    }
    if (typeLower === 'updated' || typeLower === 'modified') {
      return 'warning'
    }
    if (typeLower === 'resolved' || typeLower === 'closed') {
      return 'success'
    }
    if (typeLower === 'deleted' || typeLower === 'cancelled') {
      return 'danger'
    }
    return 'default'
  }

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
      <CardHeader>
        <h2 className="text-xl font-semibold">Events ({events.length})</h2>
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
        ) : events.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-default-500">No events recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-l-4 border-default-200 pl-4 py-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {event.event_type && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getEventTypeColor(event.event_type)}
                      >
                        {event.event_type}
                      </Chip>
                    )}
                    {event.actor_name && (
                      <span className="text-sm text-default-600">
                        by {String(event.actor_name)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-default-500">
                    {formatDate(event.created)}
                  </span>
                </div>
                {event.note && (
                  <p className="text-default-700 text-sm">
                    {String(event.note)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default TicketEventsTab

