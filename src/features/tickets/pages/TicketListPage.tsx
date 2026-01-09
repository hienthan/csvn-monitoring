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
import { Plus, Search, X, Copy, Check, Eye, Edit, Trash2, User as UserIcon } from 'lucide-react'
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

function TicketListPage() {
  const navigate = useNavigate()
  const { filters, setFilter, clearFilters } = useTicketFilters()
  const { tickets, loading, error, totalPages, currentPage, setCurrentPage, refetch } =
    useTickets(filters)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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

  const handleAction = (action: string, ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    switch (action) {
      case 'view':
        navigate(`/tickets/${ticketId}`)
        break
      case 'edit':
        navigate(`/tickets/${ticketId}`, { state: { edit: true } })
        break
      case 'delete':
        // TODO: Implement delete functionality
        console.log('Delete ticket', ticketId)
        break
    }
  }

  const renderCell = (ticket: Ticket, columnKey: string) => {
    switch (columnKey) {
      case 'code':
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">
              {ticket.code || 'N/A'}
            </span>
            {ticket.code && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-0 h-6 w-6"
                onPress={(e) => handleCopyCode(ticket.code, e as any)}
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
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {ticket.title || 'N/A'}
            </span>
            {ticket.app_name && (
              <span className="text-xs text-default-500 mt-0.5">
                {ticket.app_name}
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
        return (
          <div className="text-default-500 text-sm" title={ticket.updated}>
            {formatRelativeTime(ticket.updated)}
          </div>
        )
      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <Tooltip content="View">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={(e) => handleAction('view', ticket.id, e as any)}
                aria-label="View ticket"
              >
                <Eye size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Edit">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={(e) => handleAction('edit', ticket.id, e as any)}
                aria-label="Edit ticket"
              >
                <Edit size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Delete" color="danger">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={(e) => handleAction('delete', ticket.id, e as any)}
                aria-label="Delete ticket"
              >
                <Trash2 size={16} />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tickets</h1>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => navigate('/tickets/new')}
        >
          New Ticket
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Search tickets..."
              value={filters.q || ''}
              onValueChange={(value) => setFilter('q', value)}
              startContent={<Search size={16} />}
              endContent={
                filters.q && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setFilter('q', undefined)}
                  >
                    <X size={16} />
                  </Button>
                )
              }
            />

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                label="Status"
                placeholder="All"
                selectedKeys={filters.status ? [filters.status] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('status', value || undefined)
                }}
              >
                {[
                  <SelectItem key="all">All</SelectItem>,
                  ...Object.entries(TICKET_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  )),
                ]}
              </Select>

              <Select
                label="Priority"
                placeholder="All"
                selectedKeys={filters.priority ? [filters.priority] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('priority', value || undefined)
                }}
              >
                {[
                  <SelectItem key="all">All</SelectItem>,
                  ...Object.entries(TICKET_PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  )),
                ]}
              </Select>

              <Select
                label="Type"
                placeholder="All"
                selectedKeys={filters.type ? [filters.type] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('type', value || undefined)
                }}
              >
                {[
                  <SelectItem key="all">All</SelectItem>,
                  ...Object.entries(TICKET_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  )),
                ]}
              </Select>

              <Select
                label="Environment"
                placeholder="All"
                selectedKeys={filters.environment ? [filters.environment] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFilter('environment', value || undefined)
                }}
              >
                {[
                  <SelectItem key="all">All</SelectItem>,
                  ...Object.entries(TICKET_ENVIRONMENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  )),
                ]}
              </Select>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="light"
                    color="danger"
                    startContent={<X size={16} />}
                    onPress={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Tickets table"
            selectionMode="none"
            removeWrapper
            classNames={{
              base: 'min-h-[400px]',
              th: 'text-left text-xs font-semibold text-default-500 uppercase px-4 py-3',
              td: 'text-left text-sm px-4 py-3 align-middle',
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
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            showShadow
          />
        </div>
      )}
    </div>
  )
}

export default TicketListPage
