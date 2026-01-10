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
} from '@heroui/react'
import { Search, X, MoreVertical } from 'lucide-react'
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

  const handleAction = (action: string, server: Server) => {
    switch (action) {
      case 'view':
        navigate(`/servers/${server.id}`)
        break
      case 'edit':
        console.log('Edit server', server.id)
        break
      case 'delete':
        console.log('Delete server', server.id)
        break
    }
  }

  const columns = [
    { key: 'name', label: 'NAME' },
    { key: 'ip_host', label: 'IP/HOST' },
    { key: 'docker_mode', label: 'DOCKER MODE' },
    { key: 'environment', label: 'ENVIRONMENT' },
    { key: 'os', label: 'OS' },
    { key: 'status', label: 'STATUS' },
    { key: 'updated', label: 'UPDATED' },
    { key: 'actions', label: 'ACTIONS' },
  ]

  const renderCell = (server: Server, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return <div className="font-medium text-foreground">{server.name || 'N/A'}</div>
      case 'ip_host':
        return <div className="text-default-600">{server.ip || server.host || 'N/A'}</div>
      case 'docker_mode':
        return <div className="text-default-600">{formatDockerMode(server.docker_mode)}</div>
      case 'environment':
        return <div className="text-default-600">{server.environment || 'N/A'}</div>
      case 'os':
        return <div className="text-default-600">{server.os || 'N/A'}</div>
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
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="More options"
                  className="text-default-400 hover:text-foreground"
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Server actions"
                variant="flat"
                onAction={(key) => {
                  const action = key as string
                  if (action) {
                    handleAction(action, server)
                  }
                }}
              >
                <DropdownItem key="view" textValue="View server">View Details</DropdownItem>
                <DropdownItem key="edit" textValue="Edit server">Edit</DropdownItem>
                <DropdownItem key="delete" className="text-danger" color="danger" textValue="Delete server">Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b border-divider pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Servers</h1>
          <div className="flex items-center gap-2">
            {loading ? (
              <Skeleton className="h-4 w-32 rounded mt-1" />
            ) : (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
                <p className="text-sm font-medium text-default-500">
                  {servers.length > 0 ? `${servers.length} Servers Active` : 'No servers configured'}
                </p>
              </>
            )}
          </div>
        </div>
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

      <Card shadow="sm" className="border-none bg-content1 overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Servers table"
            selectionMode="none"
            removeWrapper
            isHeaderSticky
            isStriped
            classNames={{
              base: 'max-h-[70vh]',
              table: 'min-w-[800px]',
              th: 'bg-default-50 text-default-500 font-semibold border-b border-divider h-12 px-6 first:rounded-none last:rounded-none',
              td: 'py-4 px-6',
              tr: 'hover:bg-default-100/50 cursor-pointer transition-colors',
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  align={column.key === 'actions' ? 'end' : 'start'}
                  className={
                    column.key === 'actions'
                      ? 'w-[80px]'
                      : column.key === 'status'
                        ? 'w-[140px]'
                        : column.key === 'updated'
                          ? 'w-[160px]'
                          : ''
                  }
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
                <div className="py-20">
                  <EmptyState
                    title={localSearchQuery ? 'No match found' : 'Infrastructure is quiet'}
                    description={localSearchQuery ? `We couldn't find any server matching "${localSearchQuery}"` : "Start by adding your first server to the dashboard."}
                    actionLabel={localSearchQuery ? 'Clear Filters' : 'Add New Server'}
                    onAction={localSearchQuery ? () => { setLocalSearchQuery(''); setSearchQuery(''); } : undefined}
                  />
                </div>
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
