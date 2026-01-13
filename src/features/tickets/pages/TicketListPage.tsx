import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Skeleton,
  Card,
  CardBody,
  Button,
  Pagination,
  Select,
  SelectItem,
  Input,
  Tooltip,
} from '@heroui/react'
import { Plus, Search, X, Copy, Check, User as UserIcon, Ticket as TicketIcon } from 'lucide-react'
import { EyeIcon, EditIcon, DeleteIcon } from '@/components/icons'
import { useTickets } from '../hooks/useTickets'
import { useTicketFilters } from '../hooks/useTicketFilters'
import type { Ticket } from '../types'
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
  TICKET_ENVIRONMENT_LABELS,
  getTicketStatusColor,
  getTicketPriorityColor,
} from '../constants'
import { formatRelativeTime, copyTicketCode } from '../utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { TicketEditModal } from '../components/TicketEditModal'

import { PageContainer } from '@/components/PageContainer'

function TicketListPage() {
  const navigate = useNavigate()
  const { filters, setFilter, clearFilters } = useTicketFilters()
  const { tickets, loading, error, totalPages, currentPage, setCurrentPage, refetch, totalItems } =
    useTickets(filters)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleCopyCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await copyTicketCode(code)
    if (success) {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }

  const handleRowClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setFilter('page', newPage)
  }

  const hasActiveFilters = Boolean(
    filters.q || filters.status || filters.priority || filters.type || filters.environment || filters.assignee
  )

  const columns = [
    { key: 'code', label: 'CODE' },
    { key: 'title', label: 'TITLE' },
    { key: 'priority', label: 'PRIORITY' },
    { key: 'status', label: 'STATUS' },
    { key: 'assignee', label: 'ASSIGNEE' },
    { key: 'updated', label: 'UPDATED' },
    { key: 'actions', label: 'ACTIONS' },
  ]

  const handleEditSave = async (_payload: Partial<Ticket>, _attachmentsFiles?: File[]) => {
    await refetch()
  }

  const handleAction = (action: string, ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation()
    switch (action) {
      case 'view':
        navigate(`/tickets/${ticket.id}`)
        break
      case 'edit':
        setEditTicket(ticket)
        setEditModalOpen(true)
        break
      case 'delete':
        console.log('Delete ticket', ticket.id)
        break
    }
  }

  const renderCell = (ticket: Ticket, columnKey: string) => {
    switch (columnKey) {
      case 'code':
        return (
          <div className="flex items-center justify-center gap-2 group">
            <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
              {ticket.code || 'N/A'}
            </span>
            {ticket.code && (
              <Tooltip content="Copy Code" size="sm" closeDelay={0}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="min-w-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={(e) => handleCopyCode(ticket.code, e as any)}
                  aria-label="Copy ticket code"
                >
                  {copiedCode === ticket.code ? (
                    <Check size={12} className="text-success" />
                  ) : (
                    <Copy size={12} />
                  )}
                </Button>
              </Tooltip>
            )}
          </div>
        )
      case 'title':
        const serviceTagsText = Array.isArray(ticket.service_tags) && ticket.service_tags.length > 0
          ? ticket.service_tags.join(', ')
          : ''
        const subtitleParts = [ticket.app_name, serviceTagsText].filter(Boolean)
        return (
          <div className="flex flex-col min-w-0 py-0.5 items-center">
            <span className="font-bold text-sm text-foreground truncate leading-tight">
              {ticket.title || 'N/A'}
            </span>
            {subtitleParts.length > 0 && (
              <span className="text-[11px] text-default-400 mt-0.5 truncate uppercase tracking-wide font-medium">
                {subtitleParts.join(' · ')}
              </span>
            )}
          </div>
        )
      case 'status':
        return (
          <div className="flex justify-center">
            <Chip
              size="sm"
              variant="flat"
              color={getTicketStatusColor(ticket.status)}
            >
              {TICKET_STATUS_LABELS[ticket.status] || ticket.status || 'N/A'}
            </Chip>
          </div>
        )
      case 'priority':
        return (
          <div className="flex justify-center">
            <Chip
              size="sm"
              variant="flat"
              color={getTicketPriorityColor(ticket.priority)}
            >
              {TICKET_PRIORITY_LABELS[ticket.priority] || ticket.priority || 'N/A'}
            </Chip>
          </div>
        )
      case 'assignee':
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full bg-default-200 flex items-center justify-center flex-shrink-0">
              <UserIcon size={14} className="text-default-500" />
            </div>
            <span className="text-sm text-default-700">
              {ticket.assignee || 'Unassigned'}
            </span>
          </div>
        )
      case 'updated':
        const exactTime = ticket.updated ? new Date(ticket.updated).toLocaleString() : 'N/A'
        return (
          <div className="text-default-500 text-xs font-medium text-center" title={exactTime}>
            {formatRelativeTime(ticket.updated)}
          </div>
        )
      case 'actions':
        return (
          <div className="relative flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors">
                <EyeIcon onClick={(e) => handleAction('view', ticket, e)} />
              </span>
            </Tooltip>
            <Tooltip content="Edit ticket">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors">
                <EditIcon onClick={(e) => handleAction('edit', ticket, e)} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete ticket">
              <span className="text-lg text-danger cursor-pointer active:opacity-50 hover:text-danger-600 transition-colors">
                <DeleteIcon onClick={(e) => handleAction('delete', ticket, e)} />
              </span>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  const activeFilterSummary = []
  if (filters.status) {
    activeFilterSummary.push(`Status: ${TICKET_STATUS_LABELS[filters.status]}`)
  }
  if (filters.priority) {
    activeFilterSummary.push(`Priority: ${TICKET_PRIORITY_LABELS[filters.priority]}`)
  }
  if (filters.type) {
    activeFilterSummary.push(`Type: ${TICKET_TYPE_LABELS[filters.type]}`)
  }
  if (filters.environment) {
    activeFilterSummary.push(`Environment: ${TICKET_ENVIRONMENT_LABELS[filters.environment]}`)
  }

  if (error) {
    return (
      <PageContainer className="py-8 space-y-8">
        <div className="flex items-end justify-between border-b border-divider pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-sm text-danger">Error loading tickets: {error.message}</p>
          </div>
          <Button
            color="primary"
            variant="shadow"
            startContent={<Plus size={18} />}
            onPress={() => navigate('/tickets/new')}
            className="font-bold"
          >
            New Ticket
          </Button>
        </div>
        <Card>
          <CardBody className="p-6">
            <EmptyState
              title="Error loading tickets"
              description={error.message}
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          </CardBody>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b border-divider pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <div className="flex items-center gap-2">
            {loading ? (
              <Skeleton className="h-4 w-32 rounded mt-1 bg-content1" />
            ) : (
              <p className="text-sm font-medium text-default-500">
                {totalItems > 0 ? `${totalItems} Tickets active` : 'No tickets'}
              </p>
            )}
            {activeFilterSummary.length > 0 && (
              <>
                <div className="h-1 w-1 rounded-full bg-default-300 mx-1" />
                <p className="text-xs text-default-400">
                  {activeFilterSummary.join(' · ')}
                </p>
              </>
            )}
          </div>
        </div>
        <Button
          color="primary"
          variant="shadow"
          startContent={<Plus size={18} />}
          onPress={() => navigate('/tickets/new')}
          className="font-bold"
        >
          New Ticket
        </Button>
      </div>

      <div className="sticky top-0 z-20 transition-all">
        <div className="glassmorphism rounded-2xl p-2 shadow-lg shadow-black/5">
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Search tickets..."
              value={filters.q || ''}
              onValueChange={(value) => setFilter('q', value)}
              startContent={<Search size={18} className="text-default-400" />}
              aria-label="Search tickets"
              className="flex-1 min-w-[200px]"
              variant="flat"
              classNames={{
                inputWrapper: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none",
                input: "text-sm"
              }}
              endContent={
                filters.q && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setFilter('q', undefined)}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </Button>
                )
              }
            />

            <Select
              placeholder="Status"
              selectedKeys={filters.status ? new Set([filters.status]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                setFilter('status', value && value !== 'all' ? value : undefined)
              }}
              items={[
                { key: 'all', label: 'All Statuses' },
                ...Object.entries(TICKET_STATUS_LABELS).map(([key, label]) => ({ key, label }))
              ]}
              className="w-[140px]"
              variant="flat"
              classNames={{
                trigger: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none"
              }}
              aria-label="Filter by status"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Select
              placeholder="Priority"
              selectedKeys={filters.priority ? new Set([filters.priority]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                setFilter('priority', value && value !== 'all' ? value : undefined)
              }}
              items={[
                { key: 'all', label: 'All Priorities' },
                ...Object.entries(TICKET_PRIORITY_LABELS).map(([key, label]) => ({ key, label }))
              ]}
              className="w-[140px]"
              variant="flat"
              classNames={{
                trigger: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none"
              }}
              aria-label="Filter by priority"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            {hasActiveFilters && (
              <Button
                variant="light"
                color="danger"
                startContent={<X size={16} />}
                onPress={clearFilters}
                className="font-medium"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card shadow="none" className="border border-divider bg-content1 overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Tickets table"
            selectionMode="none"
            removeWrapper
            isStriped
            classNames={{
              base: 'min-h-[400px]',
              th: 'bg-content2 text-default-500 font-black text-[10px] uppercase tracking-wider h-10 px-4 first:rounded-none last:rounded-none border-b border-divider',
              td: 'py-2 px-4 border-b border-divider/50',
              tr: 'hover:bg-content3 cursor-pointer transition-colors',
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  align="center"
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={tickets}
              isLoading={loading}
              loadingContent={
                <>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton className="h-5 w-full rounded bg-content1" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              }
              emptyContent={
                <EmptyState
                  title={hasActiveFilters ? "No tickets found" : "No tickets yet"}
                  description={hasActiveFilters ? "Try adjusting your filters to see more results." : "Create your first ticket to start tracking work."}
                  actionLabel={hasActiveFilters ? undefined : "New Ticket"}
                  onAction={hasActiveFilters ? undefined : () => navigate('/tickets/new')}
                  icon={TicketIcon}
                />
              }
            >
              {(ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() => handleRowClick(ticket.id)}
                >
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(ticket, columnKey as string)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            variant="flat"
            color="primary"
          />
        </div>
      )}

      {editTicket && (
        <TicketEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditTicket(null)
          }}
          ticket={editTicket}
          onSave={async (payload, attachmentsFiles) => {
            await handleEditSave(payload, attachmentsFiles)
            setEditModalOpen(false)
            setEditTicket(null)
          }}
        />
      )}
    </PageContainer>
  )
}

export default TicketListPage
