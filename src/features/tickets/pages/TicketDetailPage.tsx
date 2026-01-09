import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Tabs, Tab, Chip, Card, CardBody, Skeleton, Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { useTicket } from '../hooks/useTicket'
import TicketOverviewTab from '../components/TicketOverviewTab'
import TicketCommentsTab from '../components/TicketCommentsTab'
import TicketEventsTab from '../components/TicketEventsTab'

function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { ticket, loading } = useTicket(ticketId)

  const getActiveTab = () => {
    if (location.pathname.includes('/comments')) return 'comments'
    if (location.pathname.includes('/events')) return 'events'
    return 'overview'
  }

  const handleTabChange = (key: string) => {
    if (key === 'overview') {
      navigate(`/tickets/${ticketId}`)
    } else {
      navigate(`/tickets/${ticketId}/${key}`)
    }
  }

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase() || 'unknown'
    if (statusLower === 'open' || statusLower === 'new') {
      return 'primary'
    }
    if (statusLower === 'in_progress' || statusLower === 'assigned') {
      return 'warning'
    }
    if (statusLower === 'resolved' || statusLower === 'closed') {
      return 'success'
    }
    if (statusLower === 'cancelled') {
      return 'danger'
    }
    return 'default'
  }

  const getPriorityColor = (priority?: string) => {
    const priorityLower = priority?.toLowerCase() || 'unknown'
    if (priorityLower === 'high' || priorityLower === 'critical') {
      return 'danger'
    }
    if (priorityLower === 'medium' || priorityLower === 'normal') {
      return 'warning'
    }
    if (priorityLower === 'low') {
      return 'default'
    }
    return 'default'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/tickets')}
        >
          <ArrowLeft size={20} />
        </Button>
        <Breadcrumb
          items={[
            { label: 'Tickets', path: '/tickets' },
            {
              label: ticket?.title || `Ticket ${ticketId}`,
              path: `/tickets/${ticketId}`,
            },
          ]}
        />
      </div>

      {/* Ticket Info Header */}
      <Card>
        <CardBody className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 rounded" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {ticket?.title || 'Unknown Ticket'}
                </h1>
                <div className="flex gap-2">
                  {ticket?.status && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getStatusColor(ticket.status)}
                    >
                      {ticket.status}
                    </Chip>
                  )}
                  {ticket?.priority && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getPriorityColor(ticket.priority)}
                    >
                      {ticket.priority}
                    </Chip>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-default-500">Assignee</p>
                  <p className="font-medium">
                    {ticket?.assignee || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Created</p>
                  <p className="font-medium">
                    {ticket?.created
                      ? new Date(ticket.created).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Updated</p>
                  <p className="font-medium">
                    {ticket?.updated
                      ? new Date(ticket.updated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Ticket ID</p>
                  <p className="font-medium">{ticketId}</p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        selectedKey={getActiveTab()}
        onSelectionChange={(key) => handleTabChange(key as string)}
        aria-label="Ticket detail tabs"
      >
        <Tab key="overview" title="Overview" />
        <Tab key="comments" title="Comments" />
        <Tab key="events" title="Events" />
      </Tabs>

      {/* Tab Content */}
      {getActiveTab() === 'overview' && <TicketOverviewTab ticketId={ticketId} />}
      {getActiveTab() === 'comments' && (
        <TicketCommentsTab ticketId={ticketId} />
      )}
      {getActiveTab() === 'events' && <TicketEventsTab ticketId={ticketId} />}
    </div>
  )
}

export default TicketDetailPage

