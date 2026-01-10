import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs,
  Tab,
  Chip,
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
} from '@heroui/react'
import { ArrowLeft, Edit, MoreVertical, Copy as CopyIcon } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { useTicket } from '../hooks/useTicket'
import { useApiError } from '@/lib/hooks/useApiError'
import { addEvent } from '../services/events.service'
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
import { copyTicketCode } from '../utils'
import { copyToClipboard } from '@/lib/utils/clipboard'
import type { TicketStatus, Ticket } from '../types'

import { PageContainer } from '@/components/PageContainer'

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
      setStatusModalOpen(false)
      setSelectedNewStatus(null)
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
      const changedFields: string[] = []
      if (payload.title !== undefined && payload.title !== ticket.title) changedFields.push('title')
      if (payload.description !== undefined && payload.description !== ticket.description) changedFields.push('description')
      if (payload.type !== undefined && payload.type !== ticket.type) changedFields.push('type')
      if (payload.priority !== undefined && payload.priority !== ticket.priority) changedFields.push('priority')
      if (payload.environment !== undefined && payload.environment !== ticket.environment) changedFields.push('environment')
      if (payload.app_name !== undefined && payload.app_name !== ticket.app_name) changedFields.push('app_name')

      const actorName = (payload as any).actorName || ticket.assignee || 'System'
      await update(payload, attachmentsFiles)

      if (changedFields.length > 0) {
        await addEvent({
          ticket: ticket.id,
          event_type: 'note',
          actor_name: actorName,
          note: `ticket_updated: ${changedFields.join(', ')} `,
        })
      }
      await refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  if (error) {
    return (
      <PageContainer className="py-8">
        <Card>
          <CardBody className="p-6">
            <div className="text-center space-y-4 py-8">
              <p className="text-danger">Error loading ticket: {error.message}</p>
              <Button color="primary" onPress={() => navigate('/tickets')}>
                Back to Tickets
              </Button>
            </div>
          </CardBody>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => navigate('/tickets')}
              aria-label="Back to tickets"
              size="sm"
            >
              <ArrowLeft size={16} />
            </Button>
            <Breadcrumb
              items={[
                { label: 'Tickets', path: '/tickets' },
                {
                  label: ticket?.code || `Ticket ${ticketId} `,
                  path: `/ tickets / ${ticketId} `,
                },
              ]}
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {loading ? <Skeleton className="h-9 w-64 rounded" /> : (ticket?.title || 'Unknown Ticket')}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <Skeleton className="h-6 w-20 rounded" />
              ) : ticket?.status && (
                <Chip
                  size="sm"
                  variant="shadow"
                  color={getTicketStatusColor(ticket.status)}
                  className="font-bold uppercase tracking-wider"
                >
                  {TICKET_STATUS_LABELS[ticket.status]}
                </Chip>
              )}
              {loading ? (
                <Skeleton className="h-6 w-24 rounded" />
              ) : ticket?.priority && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={getTicketPriorityColor(ticket.priority)}
                  className="font-semibold"
                >
                  {TICKET_PRIORITY_LABELS[ticket.priority]}
                </Chip>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            color="primary"
            variant="shadow"
            onPress={handleStatusChangeClick}
            isDisabled={isChangingStatus || loading}
            className="font-bold px-6"
          >
            Update Status
          </Button>
          <Button
            variant="flat"
            startContent={<Edit size={16} />}
            onPress={() => setEditModalOpen(true)}
            isDisabled={loading}
            className="font-semibold"
          >
            Edit
          </Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <MoreVertical size={20} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu onAction={(key) => {
              if (key === 'copy-link') handleCopyLink()
              if (key === 'copy-code') handleCopyCode()
            }}>
              <DropdownItem key="copy-link" startContent={<CopyIcon size={16} />}>Copy Link</DropdownItem>
              <DropdownItem key="copy-code" startContent={<CopyIcon size={16} />}>Copy Code</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card shadow="sm" className="border-none bg-content1 overflow-hidden">
            <CardBody className="p-0">
              <Tabs
                variant="underlined"
                color="primary"
                aria-label="Ticket detail tabs"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none border-b border-divider px-6 pt-2 h-14",
                  cursor: "w-full bg-primary h-0.5",
                  tab: "max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-primary font-bold transition-all"
                }}
              >
                <Tab key="overview" title="Overview">
                  <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <TicketOverviewTab ticketId={ticketId!} />
                  </div>
                </Tab>
                <Tab key="comments" title="Comments">
                  <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <TicketCommentsTab ticketId={ticketId!} />
                  </div>
                </Tab>
                <Tab key="events" title="Events">
                  <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <TicketEventsTab ticketId={ticketId!} />
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Metadata Sidebar could go here for cleaner look */}
        </div>
      </div>

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

      {ticket && (
        <TicketEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          ticket={ticket}
          onSave={handleEditSave}
        />
      )}
    </PageContainer>
  )
}

export default TicketDetailPage
