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
        // TODO: Implement edit functionality
        console.log('Edit server', server.id)
        break
      case 'delete':
        // TODO: Implement delete functionality
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
        return (
          <div className="font-medium text-foreground">{server.name || 'N/A'}</div>
        )
      case 'ip_host':
        return (
          <div className="text-default-600">
            {server.ip || server.host || 'N/A'}
          </div>
        )
      case 'docker_mode':
        return (
          <div className="text-default-600">
            {formatDockerMode(server.docker_mode)}
          </div>
        )
      case 'environment':
        return (
          <div className="text-default-600">{server.environment || 'N/A'}</div>
        )
      case 'os':
        return <div className="text-default-600">{server.os || 'N/A'}</div>
      case 'status':
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(server.status)}
          >
            {getStatusLabel(server.status)}
          </Chip>
        )
      case 'updated':
        const exactTime = server.updated ? new Date(server.updated).toLocaleString() : 'N/A'
        return (
          <div className="text-default-500 text-sm" title={exactTime}>
            {formatRelativeTime(server.updated)}
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
                aria-label="Server actions"
                onAction={(key) => {
                  const actionMap: Record<string, string> = {
                    view: 'view',
                    edit: 'edit',
                    delete: 'delete',
                  }
                  const action = actionMap[key as string]
                  if (action) {
                    handleAction(action, server)
                  }
                }}
              >
                <DropdownItem key="view" textValue="View server">
                  View
                </DropdownItem>
                <DropdownItem key="edit" textValue="Edit server">
                  Edit
                </DropdownItem>
                <DropdownItem key="delete" className="text-danger" textValue="Delete server">
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

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Servers</h1>
            <p className="text-sm text-default-500 mt-1">Error loading servers</p>
          </div>
        </div>
        <Card>
          <CardBody className="p-6">
            <EmptyState
              title="Error loading servers"
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
          <h1 className="text-2xl font-semibold">Servers</h1>
          {loading ? (
            <Skeleton className="h-4 w-32 rounded mt-1" />
          ) : (
            <p className="text-sm text-default-500 mt-1">
              {servers.length > 0 ? `${servers.length} servers` : 'No servers'}
            </p>
          )}
        </div>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-divider -mx-6 px-6">
        <Card>
          <CardBody className="py-3">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <Input
                placeholder="Search servers..."
                value={localSearchQuery}
                onValueChange={handleSearchChange}
                startContent={<Search size={16} />}
                aria-label="Search servers"
                className="flex-1 min-w-[200px]"
                size="sm"
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
          </CardBody>
        </Card>
      </div>

      {/* Servers Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Servers table"
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
                      : column.key === 'status'
                      ? 'w-[100px]'
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
              items={servers}
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
                    localSearchQuery
                      ? 'No servers found matching your search'
                      : 'No servers yet'
                  }
                  actionLabel={
                    localSearchQuery
                      ? 'Clear search'
                      : undefined
                  }
                  onAction={
                    localSearchQuery
                      ? () => {
                          setLocalSearchQuery('')
                          setSearchQuery('')
                        }
                      : undefined
                  }
                />
              }
            >
              {(server) => (
                <TableRow
                  key={server.id}
                  className="cursor-pointer hover:bg-default-100 transition-colors"
                  onClick={() => handleRowClick(server.id)}
                >
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(server, columnKey as string)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}

export default Servers
