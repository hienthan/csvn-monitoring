import { Card, CardBody, CardHeader, Skeleton, Chip, Button } from '@heroui/react'
import { ExternalLink, Edit, File, Download } from 'lucide-react'
import { useTicket } from '../hooks/useTicket'
import {
  TICKET_TYPE_LABELS,
  TICKET_ENVIRONMENT_LABELS,
} from '../constants'
import { parseLinks, pbFilesUrls } from '../utils'

interface TicketOverviewTabProps {
  ticketId?: string
  onEditClick?: () => void
}

function TicketOverviewTab({ ticketId, onEditClick }: TicketOverviewTabProps) {
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
      <div className="space-y-4">
        <Card>
          <CardBody>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Skeleton className="h-32 w-full rounded" />
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!ticket) {
    return (
      <Card>
        <CardBody>
          <p className="text-default-500">Ticket not found</p>
        </CardBody>
      </Card>
    )
  }

  const links = parseLinks(ticket.links)
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

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Summary</h2>
          {onEditClick && (
            <Button
              size="sm"
              variant="flat"
              startContent={<Edit size={16} />}
              onPress={onEditClick}
            >
              Edit
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-default-500">Code</p>
              <p className="font-mono font-medium">{ticket.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Type</p>
              <p className="font-medium">
                {TICKET_TYPE_LABELS[ticket.type] || ticket.type || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Environment</p>
              <p className="font-medium">
                {TICKET_ENVIRONMENT_LABELS[ticket.environment] ||
                  ticket.environment ||
                  'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">App Name</p>
              <p className="font-medium">{ticket.app_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Service Tags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {ticket.service_tags && ticket.service_tags.length > 0 ? (
                  ticket.service_tags.map((tag) => (
                    <Chip key={tag} size="sm" variant="flat" color="primary">
                      {tag}
                    </Chip>
                  ))
                ) : (
                  <span className="text-default-400">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-default-500">Requester</p>
              <p className="font-medium">{ticket.requester_name || 'N/A'}</p>
              {ticket.requester_contact && (
                <p className="text-sm text-default-500">{ticket.requester_contact}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-default-500">Assignee</p>
              <p className="font-medium">{ticket.assignee || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Due Date</p>
              <p className="font-medium">
                {ticket.due_at ? formatDate(ticket.due_at) : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Started At</p>
              <p className="font-medium">
                {ticket.started_at ? formatDate(ticket.started_at) : 'Not started'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Resolved At</p>
              <p className="font-medium">
                {ticket.resolved_at ? formatDate(ticket.resolved_at) : 'Not resolved'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Description</h2>
        </CardHeader>
        <CardBody>
          <div className="prose max-w-none">
            <p className="text-default-700 whitespace-pre-wrap">
              {ticket.description || 'No description provided.'}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Links Card */}
      {links.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Links</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {link.label || link.url}
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Attachments Card */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Attachments</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {pbFilesUrls('ma_tickets', ticket.id, ticket.attachments).map(
                (url, index) => {
                  const fileName = ticket.attachments?.[index] || `file-${index}`
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-default-100 rounded text-sm"
                    >
                      <File size={16} className="text-default-500" />
                      <span className="flex-1 truncate">{fileName}</span>
                      <div className="flex gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          as="a"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          as="a"
                          href={url}
                          download
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default TicketOverviewTab
