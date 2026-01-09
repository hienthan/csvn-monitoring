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
  Select,
  SelectItem,
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
  TICKET_ENVIRONMENT_LABELS,
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
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const handleStatusChange = async (params: {
    actorName: string
    note?: string
    clearResolvedAt?: boolean
  }) => {
    if (!ticket || !selectedNewStatus) return

    setIsChangingStatus(true)
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
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleStatusSelect = (status: TicketStatus) => {
    // Check if changing to Resolved/Closed status - show confirmation
    if (status === 'done' || status === 'rejected') {
      setSelectedNewStatus(status)
      setStatusModalOpen(true)
    } else {
      setSelectedNewStatus(status)
      setStatusModalOpen(true)
    }
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
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/tickets')}
          aria-label="Back to tickets"
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
            <div className="text-center space-y-4 py-8">
              <p className="text-danger">Error loading ticket: {error.message}</p>
              <Button color="primary" onPress={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : ticket ? (
            <div className="space-y-6">
              {/* Header: Left (Title + Meta) and Right (Actions) */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left: Title + Meta Chips */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-3 break-words">
                    {ticket.title || 'Unknown Ticket'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
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
                    {ticket.environment && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color="default"
                      >
                        {TICKET_ENVIRONMENT_LABELS[ticket.environment]}
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 justify-end lg:justify-start">
                  {/* Primary: Change Status Select */}
                  <Select
                    placeholder="Change Status"
                    selectedKeys={ticket.status ? new Set([ticket.status]) : new Set()}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as TicketStatus
                      if (value && value !== ticket.status) {
                        handleStatusSelect(value)
                      }
                    }}
                    isDisabled={isChangingStatus || loading}
                    className="min-w-[160px]"
                    size="sm"
                    variant="flat"
                    color="primary"
                    aria-label="Change ticket status"
                    selectionMode="single"
                  >
                    {allStatuses.map((status) => (
                      <SelectItem key={status} textValue={TICKET_STATUS_LABELS[status]}>
                        {TICKET_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Secondary: Edit Button */}
                  <Button
                    variant="flat"
                    startContent={<Edit size={16} />}
                    onPress={() => setEditModalOpen(true)}
                    isDisabled={loading}
                    aria-label="Edit ticket"
                  >
                    Edit
                  </Button>

                  {/* Icon-only: Refresh */}
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => refetch()}
                    isDisabled={loading}
                    aria-label="Refresh ticket"
                  >
                    <RefreshCw size={16} />
                  </Button>

                  {/* Icon-only: More Menu */}
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant="light"
                        aria-label="More options"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="More options">
                      <DropdownItem key="copy" textValue="Copy ticket link">
                        Copy Link
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            defaultSelectedKey="overview"
            aria-label="Ticket detail tabs"
            classNames={{
              base: "w-full",
              tabList: "px-6 pt-4",
              panel: "px-6 pb-6",
            }}
          >
            <Tab key="overview" title="Overview">
              <div className="pt-4">
                <TicketOverviewTab ticketId={ticketId} />
              </div>
            </Tab>
            <Tab key="comments" title="Comments">
              <div className="pt-4">
                <TicketCommentsTab ticketId={ticketId} />
              </div>
            </Tab>
            <Tab key="events" title="Events">
              <div className="pt-4">
                <TicketEventsTab ticketId={ticketId} />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

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
