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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import { Plus, Search, X, Copy, Check, MoreVertical, User as UserIcon } from 'lucide-react'
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
import { EmptyState } from '@/components/EmptyState'
import { TicketEditModal } from '../components/TicketEditModal'

function TicketListPage() {
  const navigate = useNavigate()
  const { filters, setFilter, clearFilters } = useTicketFilters()
  const { tickets, loading, error, totalPages, currentPage, setCurrentPage, refetch, totalItems } =
    useTickets(filters)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleCopyCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
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
    // This will be handled by the modal's onSave prop
    // Just refetch after save
    await refetch()
  }

  const handleAction = (action: string, ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    switch (action) {
      case 'view':
        navigate(`/tickets/${ticket.id}`)
        break
      case 'edit':
        setEditTicket(ticket)
        setEditModalOpen(true)
        break
      case 'delete':
        // TODO: Implement delete functionality
        console.log('Delete ticket', ticket.id)
        break
    }
  }

  const renderCell = (ticket: Ticket, columnKey: string) => {
    switch (columnKey) {
      case 'code':
        return (
          <div className="flex items-center gap-2 group">
            <span className="font-mono text-sm font-medium text-foreground">
              {ticket.code || 'N/A'}
            </span>
            {ticket.code && (
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
            )}
          </div>
        )
      case 'title':
        const serviceTagsText = Array.isArray(ticket.service_tags) && ticket.service_tags.length > 0
          ? ticket.service_tags.join(', ')
          : ''
        const subtitleParts = [ticket.app_name, serviceTagsText].filter(Boolean)
        return (
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground truncate">
              {ticket.title || 'N/A'}
            </span>
            {subtitleParts.length > 0 && (
              <span className="text-xs text-default-500 mt-0.5 truncate">
                {subtitleParts.join(' · ')}
              </span>
            )}
          </div>
        )
      case 'status':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getTicketStatusColor(ticket.status)}
          >
            {TICKET_STATUS_LABELS[ticket.status] || ticket.status || 'N/A'}
          </Chip>
        )
      case 'priority':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getTicketPriorityColor(ticket.priority)}
          >
            {TICKET_PRIORITY_LABELS[ticket.priority] || ticket.priority || 'N/A'}
          </Chip>
        )
      case 'assignee':
        return (
          <div className="flex items-center gap-2">
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
          <div className="text-default-500 text-sm" title={exactTime}>
            {formatRelativeTime(ticket.updated)}
          </div>
        )
      case 'actions':
        return (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="More options"
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Ticket actions"
                onAction={(key) => {
                  const actionMap: Record<string, string> = {
                    view: 'view',
                    edit: 'edit',
                    delete: 'delete',
                  }
                  const action = actionMap[key as string]
                  if (action) {
                    handleAction(action, ticket, {} as React.MouseEvent)
                  }
                }}
              >
                <DropdownItem key="view" textValue="View ticket">
                  View
                </DropdownItem>
                <DropdownItem key="edit" textValue="Edit ticket">
                  Edit
                </DropdownItem>
                <DropdownItem key="delete" className="text-danger" textValue="Delete ticket">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )
      default:
        return null
    }
  }

  // Build active filter summary
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
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tickets</h1>
            <p className="text-sm text-default-500 mt-1">Error loading tickets</p>
          </div>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => navigate('/tickets/new')}
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
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          {loading ? (
            <Skeleton className="h-4 w-32 rounded mt-1" />
          ) : (
            <p className="text-sm text-default-500 mt-1">
              {totalItems > 0 ? `${totalItems} tickets` : 'No tickets'}
            </p>
          )}
          {activeFilterSummary.length > 0 && (
            <p className="text-xs text-default-400 mt-0.5">
              {activeFilterSummary.join(' · ')}
            </p>
          )}
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => navigate('/tickets/new')}
        >
          New Ticket
        </Button>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-divider -mx-6 px-6">
        <Card>
          <CardBody className="py-3">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <Input
                placeholder="Search tickets..."
                value={filters.q || ''}
                onValueChange={(value) => setFilter('q', value)}
                startContent={<Search size={16} />}
                aria-label="Search tickets"
                className="flex-1 min-w-[200px]"
                size="sm"
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

              {/* Compact Selects */}
              <Select
                label="Status"
                placeholder="All"
                selectedKeys={filters.status ? new Set([filters.status]) : new Set()}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('status', value && value !== 'all' ? value : undefined)
                }}
                className="min-w-[140px]"
                size="sm"
                selectionMode="single"
              >
                {Object.entries(TICKET_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Priority"
                placeholder="All"
                selectedKeys={filters.priority ? new Set([filters.priority]) : new Set()}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('priority', value && value !== 'all' ? value : undefined)
                }}
                className="min-w-[140px]"
                size="sm"
                selectionMode="single"
              >
                {Object.entries(TICKET_PRIORITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Type"
                placeholder="All"
                selectedKeys={filters.type ? new Set([filters.type]) : new Set()}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('type', value && value !== 'all' ? value : undefined)
                }}
                className="min-w-[160px]"
                size="sm"
                selectionMode="single"
              >
                {Object.entries(TICKET_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Environment"
                placeholder="All"
                selectedKeys={filters.environment ? new Set([filters.environment]) : new Set()}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('environment', value && value !== 'all' ? value : undefined)
                }}
                className="min-w-[140px]"
                size="sm"
                selectionMode="single"
              >
                {Object.entries(TICKET_ENVIRONMENT_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="light"
                  color="danger"
                  startContent={<X size={16} />}
                  onPress={clearFilters}
                  size="sm"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-divider">
                {filters.status && (
                  <Chip
                    size="sm"
                    variant="flat"
                    onClose={() => setFilter('status', undefined)}
                  >
                    Status: {TICKET_STATUS_LABELS[filters.status]}
                  </Chip>
                )}
                {filters.priority && (
                  <Chip
                    size="sm"
                    variant="flat"
                    onClose={() => setFilter('priority', undefined)}
                  >
                    Priority: {TICKET_PRIORITY_LABELS[filters.priority]}
                  </Chip>
                )}
                {filters.type && (
                  <Chip
                    size="sm"
                    variant="flat"
                    onClose={() => setFilter('type', undefined)}
                  >
                    Type: {TICKET_TYPE_LABELS[filters.type]}
                  </Chip>
                )}
                {filters.environment && (
                  <Chip
                    size="sm"
                    variant="flat"
                    onClose={() => setFilter('environment', undefined)}
                  >
                    Environment: {TICKET_ENVIRONMENT_LABELS[filters.environment]}
                  </Chip>
                )}
                {filters.q && (
                  <Chip
                    size="sm"
                    variant="flat"
                    onClose={() => setFilter('q', undefined)}
                  >
                    Search: {filters.q}
                  </Chip>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Tickets table"
            selectionMode="none"
            removeWrapper
            classNames={{
              base: 'min-h-[400px]',
              th: 'text-left text-xs uppercase tracking-wide text-foreground-500 px-4 py-2',
              td: 'text-left text-sm px-4 py-2 align-middle',
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  className={
                    column.key === 'actions'
                      ? 'text-center w-[120px]'
                      : column.key === 'status' || column.key === 'priority'
                      ? 'w-[100px]'
                      : column.key === 'code'
                      ? 'w-[140px]'
                      : column.key === 'updated'
                      ? 'w-[120px]'
                      : 'text-left'
                  }
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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              }
              emptyContent={
                <EmptyState
                  title={
                    hasActiveFilters
                      ? 'No tickets found matching your filters'
                      : 'No tickets yet'
                  }
                  actionLabel={
                    hasActiveFilters
                      ? 'Clear filters'
                      : 'Create first ticket'
                  }
                  onAction={
                    hasActiveFilters
                      ? clearFilters
                      : () => navigate('/tickets/new')
                  }
                />
              }
            >
              {(ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-default-100 transition-colors"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            showShadow
            size="sm"
          />
        </div>
      )}

      {/* Edit Modal */}
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
    </div>
  )
}

export default TicketListPage
