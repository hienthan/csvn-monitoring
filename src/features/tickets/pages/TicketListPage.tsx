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
} from '@heroui/react'
import { Plus, Search, X, Copy, Check } from 'lucide-react'
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
    { key: 'code', label: 'Code' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'type', label: 'Type' },
    { key: 'environment', label: 'Env' },
    { key: 'app_name', label: 'App' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'updated', label: 'Updated' },
  ]

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
          <div className="font-medium text-foreground">
            {ticket.title || 'N/A'}
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
      case 'type':
        return (
          <div className="text-default-600 text-sm">
            {TICKET_TYPE_LABELS[ticket.type] || ticket.type || 'N/A'}
          </div>
        )
      case 'environment':
        return (
          <div className="text-default-600 text-sm">
            {TICKET_ENVIRONMENT_LABELS[ticket.environment] || ticket.environment || 'N/A'}
          </div>
        )
      case 'app_name':
        return (
          <div className="text-default-600">{ticket.app_name || 'N/A'}</div>
        )
      case 'assignee':
        return (
          <div className="text-default-600">{ticket.assignee || 'Unassigned'}</div>
        )
      case 'updated':
        return (
          <div className="text-default-500 text-sm" title={ticket.updated}>
            {formatRelativeTime(ticket.updated)}
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
            <div className="text-center space-y-4">
              <p className="text-danger text-lg font-medium">
                Error loading tickets
              </p>
              <p className="text-default-600">{error.message}</p>
              <Button color="primary" onPress={() => refetch()}>
                Retry
              </Button>
            </div>
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
              th: 'text-left text-xs font-semibold px-4 py-2',
              td: 'text-left text-sm px-4 py-2',
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} className="text-left">
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
                <div className="py-16 text-center space-y-4">
                  <p className="text-default-500 text-lg">
                    {hasActiveFilters
                      ? 'No tickets found matching your filters'
                      : 'No tickets yet'}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="light" onPress={clearFilters}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      startContent={<Plus size={16} />}
                      onPress={() => navigate('/tickets/new')}
                    >
                      Create first ticket
                    </Button>
                  )}
                </div>
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
