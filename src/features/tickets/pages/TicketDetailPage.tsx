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
import { ArrowLeft, RefreshCw, Edit, MoreVertical, Copy as CopyIcon } from 'lucide-react'
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
  TICKET_TYPE_LABELS,
  getTicketStatusColor,
  getTicketPriorityColor,
} from '../constants'
import type { TicketStatus, Ticket } from '../types'
import { useApiError } from '@/lib/hooks/useApiError'
import { addEvent } from '../services/events.service'
import { copyTicketCode } from '../utils'
import { copyToClipboard } from '@/lib/utils/clipboard'

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
    newStatus: TicketStatus
    actorName: string
    note?: string
    clearResolvedAt?: boolean
  }) => {
    if (!ticket) return

    setIsChangingStatus(true)
    try {
      await changeStatus(
        params.newStatus,
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

  const handleStatusChangeInModal = (status: TicketStatus) => {
    setSelectedNewStatus(status)
  }

  const handleStatusChangeClick = () => {
    // Open modal with current status pre-selected
    if (ticket) {
      setSelectedNewStatus(ticket.status)
      setStatusModalOpen(true)
    }
  }

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(window.location.href)
    } catch (err) {
      handleError(err)
    }
  }

  const handleCopyCode = async () => {
    if (ticket?.code) {
      await copyTicketCode(ticket.code)
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
      if (payload.service_tags !== undefined) {
        const payloadTags = Array.isArray(payload.service_tags) ? payload.service_tags : []
        const ticketTags = Array.isArray(ticket.service_tags) ? ticket.service_tags : []
        if (JSON.stringify(payloadTags) !== JSON.stringify(ticketTags)) {
          changedFields.push('service_tags')
        }
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
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/tickets')}
          aria-label="Back to tickets"
        >
          <ArrowLeft size={16} />
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

      {/* Sticky Ticket Header */}
      {loading ? (
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-divider -mx-6 px-6 py-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 rounded" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardBody className="p-6">
            <div className="text-center space-y-4 py-8">
              <p className="text-danger">Error loading ticket: {error.message}</p>
              <Button color="primary" onPress={() => refetch()}>
                Retry
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : ticket ? (
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-divider -mx-6 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Title + Meta Chips */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold mb-2 break-words">
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
                {ticket.type && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                  >
                    {TICKET_TYPE_LABELS[ticket.type]}
                  </Chip>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2 justify-end lg:justify-start">
              {/* Primary: Change Status Button */}
              <Button
                variant="flat"
                color="primary"
                onPress={handleStatusChangeClick}
                isDisabled={isChangingStatus || loading}
                aria-label="Change ticket status"
                size="sm"
              >
                Change status
              </Button>

              {/* Secondary: Edit Button */}
              <Button
                variant="flat"
                startContent={<Edit size={16} />}
                onPress={() => setEditModalOpen(true)}
                isDisabled={loading}
                aria-label="Edit ticket"
                size="sm"
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
                size="sm"
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
                    size="sm"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="More options" onAction={(key) => {
                  if (key === 'copy-link') {
                    handleCopyLink()
                  } else if (key === 'copy-code') {
                    handleCopyCode()
                  }
                }}>
                  <DropdownItem key="copy-link" textValue="Copy ticket link" startContent={<CopyIcon size={16} />}>
                    Copy Link
                  </DropdownItem>
                  <DropdownItem key="copy-code" textValue="Copy ticket code" startContent={<CopyIcon size={16} />}>
                    Copy Code
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            defaultSelectedKey="overview"
            aria-label="Ticket detail tabs"
            classNames={{
              base: "w-full",
              tabList: "px-6 pt-4",
              panel: "px-6 py-5",
            }}
          >
            <Tab key="overview" title="Overview">
              <TicketOverviewTab ticketId={ticketId} />
            </Tab>
            <Tab key="comments" title="Comments">
              <TicketCommentsTab ticketId={ticketId} />
            </Tab>
            <Tab key="events" title="Events">
              <TicketEventsTab ticketId={ticketId} />
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
          onStatusChange={handleStatusChangeInModal}
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
