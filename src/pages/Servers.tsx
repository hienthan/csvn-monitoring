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
} from '@heroui/react'
import { useServers } from '@/lib/hooks/useServers'
import { useSearch } from '@/lib/contexts/SearchContext'
import type { Server } from '@/types/server'

function Servers() {
  const navigate = useNavigate()
  const { searchQuery } = useSearch()
  const { servers, loading, error } = useServers({ searchQuery })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

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

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'ip_host', label: 'IP/Host' },
    { key: 'docker_mode', label: 'Docker Mode' },
    { key: 'environment', label: 'Environment' },
    { key: 'os', label: 'OS' },
    { key: 'status', label: 'Status' },
    { key: 'updated', label: 'Updated' },
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
        return (
          <div className="text-default-500 text-sm">
            {formatDate(server.updated)}
          </div>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Servers</h1>
        <Card>
          <CardBody>
            <p className="text-danger">Error loading servers: {error.message}</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Servers</h1>
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Servers table"
            selectionMode="none"
            classNames={{
              wrapper: 'min-h-[400px]',
              th: 'text-left',
              td: 'text-left',
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
                <div className="py-12 text-center">
                  <p className="text-default-500">No servers found</p>
                </div>
              }
            >
              {(server) => (
                <TableRow
                  key={server.id}
                  className="cursor-pointer hover:bg-default-100 transition-colors"
                  onClick={() => handleRowClick(server.id)}
                >
                  {(columnKey) => (
                    <TableCell>{renderCell(server, columnKey as string)}</TableCell>
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
