import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Card,
  CardBody,
  Input,
  Button,
  Chip,
} from '@heroui/react'
import { Search, X, Plus, Server as ServerIcon } from 'lucide-react'
import { useServers } from '../hooks/useServers'
import { useSearch } from '@/lib/contexts/SearchContext'
import { useAuth } from '@/features/auth/context/AuthContext'
import type { Server } from '../types'
import { formatRelativeTime } from '@/features/tickets/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageContainer } from '@/components/PageContainer'

function ServerListPage() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useSearch()
  const { servers, loading, error, refetch } = useServers({ searchQuery })
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '')


  const formatDockerMode = (mode?: string | boolean | string[]) => {
    if (mode === undefined || mode === null) return 'N/A'
    if (Array.isArray(mode)) return mode.join(', ')
    if (typeof mode === 'boolean') {
      return mode ? 'Enabled' : 'Disabled'
    }
    const val = String(mode)
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
  }

  const { user } = useAuth()
  const canManageServers = user?.id === 1490 || user?.username === '048466'

  const handleRowClick = (serverId: string) => {
    navigate(`/servers/${serverId}`)
  }

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    setSearchQuery(value)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'ip_host', label: 'IP/Host' },
    { key: 'location', label: 'Location' },
    { key: 'docker_mode', label: 'Docker' },
    { key: 'os', label: 'OS' },
    { key: 'netdata', label: 'Netdata' },
    { key: 'updated', label: 'Updated' },
  ]

  const renderCell = (server: Server, columnKey: string) => {
    const isActive = (server as any).is_active
    const fontSize = 'text-sm'
    
    switch (columnKey) {
      case 'name':
        const env = server.environment || (server as any).env || 'Production'
        return (
          <div className="flex flex-col min-w-0 py-0.5 items-center">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${fontSize} text-foreground truncate`}>
                {server.name || 'N/A'}
              </span>
              <span className="relative flex h-2 w-2">
                {isActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-success' : 'bg-danger'}`}></span>
              </span>
            </div>
            <span className={`text-[10px] font-semibold tracking-tight ${
              env.toLowerCase() === 'production' || env.toLowerCase() === 'prd' 
                ? 'text-danger' 
                : (env.toLowerCase() === 'development' || env.toLowerCase() === 'dev')
                  ? 'text-success'
                  : 'text-default-400'
            }`}>
              {env}
            </span>
          </div>
        )
      case 'ip_host':
        return (
          <div className="flex flex-col items-center">
            <div className={`${fontSize} font-mono text-primary font-bold`}>
              {server.ip || server.host || 'N/A'}
            </div>
          </div>
        )
      case 'location':
        return (
          <div className="flex items-center justify-center">
            <span className={`${fontSize} font-bold text-foreground`}>
              {(server as any).location || 'Unknown'}
            </span>
          </div>
        )
      case 'docker_mode':
        const modeValue = server.docker_mode
        const displayMode = formatDockerMode(modeValue)
        return (
          <div className="flex justify-center">
            <span className={`${fontSize} text-foreground font-medium text-center`}>
              {displayMode}
            </span>
          </div>
        )
      case 'os':
        const osDisplay = server.os || 'Linux'
        return (
          <div className="flex justify-center">
            <span className={`${fontSize} font-bold text-foreground`}>
              {osDisplay.charAt(0).toUpperCase() + osDisplay.slice(1).toLowerCase()}
            </span>
          </div>
        )
      case 'netdata':
        const isNetdata = (server as any).is_netdata_enabled
        return (
          <div className="flex justify-center">
            <Chip
              size="sm"
              variant="flat"
              color={isNetdata ? 'success' : 'default'}
              className="h-5 text-[10px] font-bold"
            >
              {isNetdata ? 'Enabled' : 'Disabled'}
            </Chip>
          </div>
        )
      case 'updated':
        const exactTime = server.updated ? new Date(server.updated).toLocaleString() : 'N/A'
        return (
          <div className="text-default-400 text-[11px] font-bold text-center tracking-tighter" title={exactTime}>
            {formatRelativeTime(server.updated)}
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
          isDisabled={!canManageServers}
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
              items={servers}
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
                    <TableCell align="center">{renderCell(server, columnKey as string)}</TableCell>
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

export default ServerListPage
