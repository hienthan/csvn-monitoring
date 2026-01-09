import { Card, CardBody, CardHeader, Skeleton } from '@heroui/react'
import { useTicket } from '../hooks/useTicket'

interface TicketOverviewTabProps {
  ticketId?: string
}

function TicketOverviewTab({ ticketId }: TicketOverviewTabProps) {
  const { ticket, loading, error } = useTicket(ticketId)

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">Error loading ticket: {error.message}</p>
        </CardBody>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Description</h2>
      </CardHeader>
      <CardBody>
        <div className="prose max-w-none">
          <p className="text-default-700 whitespace-pre-wrap">
            {ticket?.description || 'No description provided.'}
          </p>
        </div>
      </CardBody>
    </Card>
  )
}

export default TicketOverviewTab

