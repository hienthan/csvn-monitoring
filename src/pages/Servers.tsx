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
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from '@heroui/react'
import { Search, X, Plus, Server as ServerIcon } from 'lucide-react'
import { EyeIcon, EditIcon, DeleteIcon } from '@/components/icons'
import { useServers } from '@/lib/hooks/useServers'
import { useSearch } from '@/lib/contexts/SearchContext'
import type { Server } from '@/types/server'
import { formatRelativeTime } from '@/features/tickets/utils'
import { EmptyState } from '@/components/EmptyState'
import { PageContainer } from '@/components/PageContainer'

function Servers() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useSearch()
  const { servers, loading, error, refetch } = useServers({ searchQuery })
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '')

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase() || 'unknown'
    if (statusLower === 'online' || statusLower === 'active') {
      return 'success'
    }
    if (statusLower === 'offline' || statusLower === 'inactive') {
      return 'danger'
    }
    return 'default'
  }

  const getStatusLabel = (status?: string) => {
    const statusLower = status?.toLowerCase() || 'unknown'
    if (statusLower === 'online' || statusLower === 'active') {
      return 'Online'
    }
    if (statusLower === 'offline' || statusLower === 'inactive') {
      return 'Offline'
    }
    return 'Unknown'
  }

  const formatDockerMode = (mode?: string | boolean) => {
    if (mode === undefined || mode === null) return 'N/A'
    if (typeof mode === 'boolean') {
      return mode ? 'Enabled' : 'Disabled'
    }
    return String(mode)
  }

  const handleRowClick = (serverId: string) => {
    navigate(`/servers/${serverId}`)
  }

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    setSearchQuery(value)
  }

  const handleAction = (action: string, server: Server, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    switch (action) {
      case 'view':
        navigate(`/servers/${server.id}`)
        break
      case 'edit':
        navigate(`/servers/${server.id}/edit`)
        break
      case 'delete':
        // TODO: Implement delete confirmation modal
        console.log('Delete server', server.id)
        break
    }
  }

  const columns = [
    { key: 'name', label: 'NAME' },
    { key: 'ip_host', label: 'IP/HOST' },
    { key: 'docker_mode', label: 'DOCKER' },
    { key: 'os', label: 'OS' },
    { key: 'status', label: 'STATUS' },
    { key: 'updated', label: 'UPDATED' },
    { key: 'actions', label: 'ACTIONS' },
  ]

  const renderCell = (server: Server, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex flex-col min-w-0 py-0.5">
            <span className="font-bold text-sm text-foreground truncate leading-tight">
              {server.name || 'N/A'}
            </span>
            <span className="text-[11px] text-default-400 mt-0.5 truncate uppercase tracking-wide font-medium">
              {server.environment || 'Production'}
            </span>
          </div>
        )
      case 'ip_host':
        return <div className="text-sm font-mono text-primary font-medium">{server.ip || server.host || 'N/A'}</div>
      case 'docker_mode':
        return <div className="text-xs text-default-500 font-medium">{formatDockerMode(server.docker_mode)}</div>
      case 'environment':
        return null // Removed as it is now in the Name cell
      case 'os':
        return <div className="text-xs text-default-500">{server.os || 'N/A'}</div>
      case 'status':
        const color = getStatusColor(server.status)
        const isOnline = server.status?.toLowerCase() === 'online' || server.status?.toLowerCase() === 'active'
        return (
          <div className="flex items-center gap-2">
            {isOnline && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            )}
            <Chip size="sm" variant="flat" color={color} className="capitalize">
              {getStatusLabel(server.status)}
            </Chip>
          </div>
        )
      case 'updated':
        const exactTime = server.updated ? new Date(server.updated).toLocaleString() : 'N/A'
        return (
          <div className="text-default-400 text-xs font-medium" title={exactTime}>
            {formatRelativeTime(server.updated)}
          </div>
        )
      case 'actions':
        return (
          <div className="relative flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors">
                <EyeIcon onClick={(e) => handleAction('view', server, e)} />
              </span>
            </Tooltip>
            <Tooltip content="Edit server">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors">
                <EditIcon onClick={(e) => handleAction('edit', server, e)} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete server">
              <span className="text-lg text-danger cursor-pointer active:opacity-50 hover:text-danger-600 transition-colors">
                <DeleteIcon onClick={(e) => handleAction('delete', server, e)} />
              </span>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <PageContainer className="py-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Servers</h1>
            <p className="text-sm text-default-500 mt-1">Infrastructure Monitoring</p>
          </div>
        </div>
        <Card shadow="sm" className="border-none bg-content1/50">
          <CardBody className="p-12">
            <EmptyState
              title="Error loading servers"
              description={error.message}
              actionLabel="Retry Connection"
              onAction={() => refetch()}
            />
          </CardBody>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
            Servers
            {!loading && <span className="text-sm font-normal text-default-400">({servers.length})</span>}
          </h1>
          <p className="text-sm text-default-500">Infrastructure and node monitoring</p>
        </div>
        <Button
          color="primary"
          variant="shadow"
          startContent={<Plus size={18} />}
          onPress={() => navigate('/servers/new')}
          className="font-bold"
        >
          New Server
        </Button>
      </div>

      <div className="sticky top-0 z-20 transition-all">
        <div className="glassmorphism rounded-2xl p-2 shadow-lg shadow-black/5">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Search by name, IP, or environment..."
              value={localSearchQuery}
              onValueChange={handleSearchChange}
              startContent={<Search size={18} className="text-default-400" />}
              aria-label="Search servers"
              className="flex-1"
              variant="flat"
              classNames={{
                inputWrapper: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none",
                input: "text-sm"
              }}
              endContent={
                localSearchQuery && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setLocalSearchQuery('')
                      setSearchQuery('')
                    }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </Button>
                )
              }
            />
          </div>
        </div>
      </div>

      <Card shadow="none" className="border border-divider bg-content1 overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Servers table"
            selectionMode="none"
            removeWrapper
            isHeaderSticky
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
                  align={column.key === 'actions' ? 'center' : 'start'}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={servers}
              isLoading={loading}
              loadingContent={
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton className="h-5 w-full rounded-lg bg-default-200" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              }
              emptyContent={
                <EmptyState
                  title={localSearchQuery ? 'No servers found' : 'No servers found'}
                  description={localSearchQuery ? "Try adjusting your search to see more results." : "Add a server to start monitoring infrastructure."}
                  actionLabel={localSearchQuery ? undefined : "New Server"}
                  onAction={localSearchQuery ? undefined : () => navigate('/servers/new')}
                  icon={ServerIcon}
                />
              }
            >
              {(server) => (
                <TableRow key={server.id} onClick={() => handleRowClick(server.id)}>
                  {(columnKey) => (
                    <TableCell>{renderCell(server, columnKey as string)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default Servers
