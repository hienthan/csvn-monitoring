import { useState, useEffect } from 'react'
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
import { Plus, Search, X, Copy, Check, Ticket as TicketIcon } from 'lucide-react'
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

import { PageContainer } from '@/components/PageContainer'

function TicketListPage() {
  const navigate = useNavigate()
  const { filters, setFilter, clearFilters } = useTicketFilters()
  const { tickets, loading, error, totalPages, currentPage, setCurrentPage, refetch, totalItems } =
    useTickets(filters)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  // Calculate active tickets count (excluding done, rejected, blocked)
  const [activeCount, setActiveCount] = useState<number>(0)
  
  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const pb = (await import('@/lib/pb')).default
        const filterParts: string[] = []
        filterParts.push(`(status != "done" && status != "rejected" && status != "blocked")`)
        
        if (filters.q) {
          const query = filters.q.trim().replace(/"/g, '\\"')
          filterParts.push(`(title ~ "${query}" || code ~ "${query}" || app_name ~ "${query}" || requestor_name ~ "${query}")`)
        }
        if (filters.priority) filterParts.push(`priority = "${filters.priority}"`)
        if (filters.types) filterParts.push(`types = "${filters.types}"`)
        if (filters.environment) filterParts.push(`environment = "${filters.environment}"`)
        if (filters.assignee) filterParts.push(`assignee = "${filters.assignee}"`)
        if (filters.requestor) {
          const requestorQuery = filters.requestor.trim().replace(/"/g, '\\"')
          filterParts.push(`requestor_name ~ "${requestorQuery}"`)
        }
        
        const filter = filterParts.join(' && ')
        const result = await pb.collection('ma_tickets').getList(1, 1, { filter })
        setActiveCount(result.totalItems)
      } catch (err) {
        console.error('Error fetching active count:', err)
        setActiveCount(totalItems) // Fallback
      }
    }
    
    if (!loading) {
      fetchActiveCount()
    }
  }, [filters, loading, totalItems])

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
    filters.q || filters.status || filters.priority || filters.types || filters.environment || filters.assignee || filters.requestor
  )

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'requestor', label: 'Requestor' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'created', label: 'Created' },
    { key: 'updated', label: 'Updated' },
  ]

  // handleEditSave removed as modal is removed from list

  const renderCell = (ticket: Ticket, columnKey: string) => {
    const fontSize = 'text-sm'
    
    switch (columnKey) {
      case 'code':
        return (
          <div className="flex items-center justify-center gap-1 group">
            <span className={`font-mono ${fontSize} font-bold text-primary`}>
              {ticket.code || 'N/A'}
            </span>
            {ticket.code && (
              <Tooltip content="Copy Code" size="sm" closeDelay={0}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="min-w-0 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onPress={(e) => handleCopyCode(ticket.code, e as any)}
                  aria-label="Copy ticket code"
                >
                  {copiedCode === ticket.code ? (
                    <Check size={10} className="text-success" />
                  ) : (
                    <Copy size={10} />
                  )}
                </Button>
              </Tooltip>
            )}
          </div>
        )
      case 'title':
        return (
          <div className="flex flex-col min-w-[200px] py-0.5 items-center">
            <span className={`font-bold ${fontSize} text-foreground truncate leading-tight`}>
              {ticket.title || 'N/A'}
            </span>
          </div>
        )
      case 'type':
        return (
          <div className={`flex justify-center ${fontSize} font-bold text-default-600`}>
            {TICKET_TYPE_LABELS[ticket.types] || ticket.types || 'N/A'}
          </div>
        )
      case 'status':
        return (
          <div className="flex justify-center">
            <Chip
              size="sm"
              variant="flat"
              color={getTicketStatusColor(ticket.status)}
              className="font-bold text-[10px] h-5"
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
              className="font-bold text-[10px] h-5"
            >
              {TICKET_PRIORITY_LABELS[ticket.priority] || ticket.priority || 'N/A'}
            </Chip>
          </div>
        )
      case 'requestor':
        return (
          <div className="flex items-center justify-center gap-2">
            <span className={`${fontSize} text-foreground font-bold`}>
              {ticket.requestor_name || 'N/A'}
            </span>
          </div>
        )
      case 'assignee':
        return (
          <div className="flex items-center justify-center gap-2">
            <span className={`${fontSize} text-foreground font-bold`}>
              {ticket.assignee || 'Unassigned'}
            </span>
          </div>
        )
      case 'created':
        return (
          <div className="text-default-400 text-[11px] font-bold text-center tracking-tighter" title={ticket.created}>
            {formatRelativeTime(ticket.created)}
          </div>
        )
      case 'updated':
        return (
          <div className="text-default-400 text-[11px] font-bold text-center tracking-tighter" title={ticket.updated}>
            {formatRelativeTime(ticket.updated)}
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
  if (filters.types) {
    activeFilterSummary.push(`Type: ${TICKET_TYPE_LABELS[filters.types]}`)
  }
  if (filters.environment) {
    activeFilterSummary.push(`Environment: ${TICKET_ENVIRONMENT_LABELS[filters.environment]}`)
  }
  if (filters.requestor) {
    activeFilterSummary.push(`Requestor: ${filters.requestor}`)
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
                {activeCount > 0 ? `${activeCount} Tickets active` : 'No tickets'}
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

            <Input
              placeholder="Requestor"
              value={filters.requestor || ''}
              onValueChange={(value) => setFilter('requestor', value || undefined)}
              className="w-[140px]"
              variant="flat"
              classNames={{
                inputWrapper: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none",
                input: "text-sm"
              }}
              endContent={
                filters.requestor && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setFilter('requestor', undefined)}
                    aria-label="Clear requestor filter"
                  >
                    <X size={16} />
                  </Button>
                )
              }
              aria-label="Filter by requestor"
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
              th: 'bg-content2 text-default-400 font-bold text-xs uppercase tracking-wider h-11 px-4 first:rounded-none last:rounded-none border-b border-divider',
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

    </PageContainer>
  )
}

export default TicketListPage
