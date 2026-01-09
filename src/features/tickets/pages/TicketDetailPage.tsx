import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs,
  Tab,
  Chip,
  Card,
  CardBody,
  Skeleton,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import { ArrowLeft, RefreshCw, Edit, MoreVertical } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { useTicket } from '../hooks/useTicket'
import TicketOverviewTab from '../components/TicketOverviewTab'
import TicketCommentsTab from '../components/TicketCommentsTab'
import TicketEventsTab from '../components/TicketEventsTab'
import { StatusChangeModal } from '../components/StatusChangeModal'
import { TicketEditModal } from '../components/TicketEditModal'
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  getTicketStatusColor,
  getTicketPriorityColor,
} from '../constants'
import type { TicketStatus, Ticket } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'
import { addEvent } from '../services/events.service'

function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { ticket, loading, error, refetch, changeStatus, update } = useTicket(ticketId)
  const { handleError } = useApiError()
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedNewStatus, setSelectedNewStatus] = useState<TicketStatus | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleStatusChange = async (params: {
    actorName: string
    note?: string
    clearResolvedAt?: boolean
  }) => {
    if (!ticket || !selectedNewStatus) return

    try {
      await changeStatus(
        selectedNewStatus,
        params.actorName,
        params.note,
        params.clearResolvedAt
      )
      
      // Close modal first
      setStatusModalOpen(false)
      setSelectedNewStatus(null)
      
      // Refetch to get updated ticket
      await refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleStatusSelect = (status: TicketStatus) => {
    setSelectedNewStatus(status)
    setStatusModalOpen(true)
  }

  const handleEditSave = async (
    payload: Partial<Ticket>,
    attachmentsFiles?: File[]
  ) => {
    if (!ticket) return

    try {
      // Calculate changed fields for event log
      const changedFields: string[] = []
      if (payload.title !== undefined && payload.title !== ticket.title) {
        changedFields.push('title')
      }
      if (payload.description !== undefined && payload.description !== ticket.description) {
        changedFields.push('description')
      }
      if (payload.type !== undefined && payload.type !== ticket.type) {
        changedFields.push('type')
      }
      if (payload.priority !== undefined && payload.priority !== ticket.priority) {
        changedFields.push('priority')
      }
      if (payload.environment !== undefined && payload.environment !== ticket.environment) {
        changedFields.push('environment')
      }
      if (payload.app_name !== undefined && payload.app_name !== ticket.app_name) {
        changedFields.push('app_name')
      }
      if (
        payload.service_tags !== undefined &&
        JSON.stringify(payload.service_tags) !== JSON.stringify(ticket.service_tags)
      ) {
        changedFields.push('service_tags')
      }
      if (
        payload.requester_name !== undefined &&
        payload.requester_name !== ticket.requester_name
      ) {
        changedFields.push('requester_name')
      }
      if (
        payload.requester_contact !== undefined &&
        payload.requester_contact !== ticket.requester_contact
      ) {
        changedFields.push('requester_contact')
      }
      if (payload.assignee !== undefined && payload.assignee !== ticket.assignee) {
        changedFields.push('assignee')
      }
      if (payload.due_at !== undefined && payload.due_at !== ticket.due_at) {
        changedFields.push('due_at')
      }
      if (
        payload.links !== undefined &&
        JSON.stringify(payload.links) !== JSON.stringify(ticket.links)
      ) {
        changedFields.push('links')
      }

      // Get actor name from payload or use default
      const actorName = (payload as any).actorName || ticket.assignee || 'System'

      // Update ticket
      await update(payload, attachmentsFiles)

      // Create event if there are changes
      if (changedFields.length > 0) {
        await addEvent({
          ticket: ticket.id,
          event_type: 'note',
          actor_name: actorName,
          note: `ticket_updated: ${changedFields.join(', ')}`,
        })
      }

      await refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const allStatuses: TicketStatus[] = [
    'new',
    'triage',
    'in_progress',
    'waiting_dev',
    'blocked',
    'done',
    'rejected',
  ]

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
              label: ticket?.code || `Ticket ${ticketId}`,
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
          ) : error ? (
            <div className="text-center space-y-4">
              <p className="text-danger">Error loading ticket: {error.message}</p>
              <Button color="primary" onPress={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : ticket ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold">{ticket.title || 'Unknown Ticket'}</h1>
                  <div className="flex gap-2">
                    {ticket.status && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getTicketStatusColor(ticket.status)}
                      >
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </Chip>
                    )}
                    {ticket.priority && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getTicketPriorityColor(ticket.priority)}
                      >
                        {TICKET_PRIORITY_LABELS[ticket.priority]}
                      </Chip>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="flat"
                        startContent={<MoreVertical size={16} />}
                      >
                        Change Status
                        {ticket.status && (
                          <span className="ml-2 text-xs opacity-70">
                            ({TICKET_STATUS_LABELS[ticket.status]})
                          </span>
                        )}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Status options"
                      selectedKeys={ticket.status ? new Set([ticket.status]) : new Set()}
                      selectionMode="single"
                      onAction={(key) => {
                        handleStatusSelect(key as TicketStatus)
                      }}
                    >
                      {allStatuses.map((status) => (
                        <DropdownItem
                          key={status}
                          textValue={TICKET_STATUS_LABELS[status]}
                        >
                          {TICKET_STATUS_LABELS[status]}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                  <Button
                    variant="flat"
                    startContent={<Edit size={16} />}
                    onPress={() => setEditModalOpen(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => refetch()}
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultSelectedKey="overview"
        aria-label="Ticket detail tabs"
      >
        <Tab key="overview" title="Overview">
          <TicketOverviewTab
            ticketId={ticketId}
            onEditClick={() => setEditModalOpen(true)}
          />
        </Tab>
        <Tab key="comments" title="Comments">
          <TicketCommentsTab ticketId={ticketId} />
        </Tab>
        <Tab key="events" title="Events">
          <TicketEventsTab ticketId={ticketId} />
        </Tab>
      </Tabs>

      {/* Status Change Modal */}
      {ticket && selectedNewStatus && (
        <StatusChangeModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedNewStatus(null)
          }}
          currentStatus={ticket.status}
          newStatus={selectedNewStatus}
          assignee={ticket.assignee}
          hasResolvedAt={!!ticket.resolved_at}
          onConfirm={handleStatusChange}
        />
      )}

      {/* Edit Modal */}
      {ticket && (
        <TicketEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          ticket={ticket}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}

export default TicketDetailPage
