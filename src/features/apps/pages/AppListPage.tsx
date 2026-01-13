import { useState, useEffect, useCallback } from 'react'
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
  Select,
  SelectItem,
} from '@heroui/react'
import { Search, X, Plus, Package } from 'lucide-react'
import { appService } from '../services/appService'
import { useApiError } from '@/lib/hooks/useApiError'
import { useServers } from '@/features/servers/hooks/useServers'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageContainer } from '@/components/PageContainer'
import type { ServerApp } from '../types'

function AppListPage() {
  const navigate = useNavigate()
  const { handleError } = useApiError()
  const { servers } = useServers({})
  const [apps, setApps] = useState<ServerApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [serverFilter, setServerFilter] = useState<string | undefined>(undefined)
  const [createdByFilter, setCreatedByFilter] = useState<string | undefined>(undefined)

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: string[] = []

      if (searchQuery) {
        filters.push(`name ~ "${searchQuery}" || description ~ "${searchQuery}"`)
      }

      if (serverFilter) {
        filters.push(`server = "${serverFilter}"`)
      }

      if (createdByFilter) {
        filters.push(`created_by = "${createdByFilter}"`)
      }

      const filter = filters.length > 0 ? filters.join(' && ') : ''
      const result = await appService.list({ filter, perPage: 100, expand: 'server' })
      setApps(result.items)
    } catch (err) {
      const apiError = handleError(err)
      setError(new Error(apiError.message))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, serverFilter, createdByFilter, handleError])

  // Get unique created_by values from apps
  const createdByOptions = Array.from(new Set(apps.map(app => app.created_by).filter(Boolean))) as string[]

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  const handleRowClick = (appId: string) => {
    navigate(`/apps/${appId}`)
  }

  const columns = [
    { key: 'key', label: 'App Key' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Dept' },
    { key: 'server', label: 'Server IP' },
    { key: 'port', label: 'Port' },
    { key: 'environment', label: 'Env' },
    { key: 'created_by', label: 'Created By' },
  ]

  const renderCell = (app: ServerApp, columnKey: string) => {
    const fontSize = 'text-sm'
    
    switch (columnKey) {
      case 'key':
        return (
          <div className="flex items-center justify-center">
            <div className={`font-mono ${fontSize} font-bold text-primary`}>
              {app.key || 'N/A'}
            </div>
          </div>
        )
      case 'name':
        return (
          <div className="flex items-center justify-center">
            <div className="flex flex-col min-w-0 py-0.5 items-center">
              <span className={`font-bold ${fontSize} text-foreground truncate leading-tight`}>
                {app.name || 'N/A'}
              </span>
              {app.description && (
                <span className="text-[10px] text-default-400 mt-0.5 truncate max-w-[150px] font-medium">
                  {app.description}
                </span>
              )}
            </div>
          </div>
        )
      case 'department':
        return (
          <div className={`flex items-center justify-center ${fontSize} text-default-500 font-bold uppercase`}>
            {app.department || 'N/A'}
          </div>
        )
      case 'server':
        const server = app.expand?.server
        return (
          <div className="flex items-center justify-center">
            <span className={`${fontSize} text-primary font-bold font-mono`}>
              {server?.ip || server?.host || 'N/A'}
            </span>
          </div>
        )
      case 'port':
        return (
          <div className="flex items-center justify-center">
            <span className={`${fontSize} font-mono font-bold text-default-700`}>
              {app.port || '—'}
            </span>
          </div>
        )
      case 'environment':
        const getEnvColor = (env?: string) => {
          if (!env) return 'default'
          const envLower = env.toLowerCase()
          if (envLower === 'dev' || envLower === 'development') return 'primary'
          if (envLower === 'stg' || envLower === 'staging') return 'warning'
          if (envLower === 'prd' || envLower === 'production') return 'success'
          return 'default'
        }
        return (
          <div className="flex items-center justify-center">
            {app.environment ? (
              <Chip
                size="sm"
                variant="flat"
                color={getEnvColor(app.environment)}
                className={`capitalize font-bold text-[10px] h-5`}
                startContent={<div className="ml-1 h-1 w-1 rounded-full bg-current" />}
              >
                {app.environment}
              </Chip>
            ) : (
              <span className={`${fontSize} text-default-400 font-bold uppercase`}>N/A</span>
            )}
          </div>
        )
      case 'created_by':
        return (
          <div className="flex items-center justify-center gap-2">
            <span className={`${fontSize} text-default-600 font-bold`}>
              {app.created_by || 'System'}
            </span>
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
            <h1 className="text-2xl font-bold">Apps</h1>
            <p className="text-sm text-default-500 mt-1">Application Management</p>
          </div>
        </div>
        <Card shadow="sm" className="border-none bg-content1/50">
          <CardBody className="p-12">
            <EmptyState
              title="Error loading apps"
              description={error.message}
              actionLabel="Retry Connection"
              onAction={() => fetchApps()}
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
            Apps
            {!loading && <span className="text-sm font-normal text-default-400">({apps.length})</span>}
          </h1>
          <p className="text-sm text-default-500">Application and service management</p>
        </div>
        <Button
          color="primary"
          variant="shadow"
          startContent={<Plus size={18} />}
          onPress={() => navigate('/apps/new')}
          className="font-bold"
        >
          New App
        </Button>
      </div>

      <div className="sticky top-0 z-20 transition-all">
        <div className="glassmorphism rounded-2xl p-2 shadow-lg shadow-black/5">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Search by name or description..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={18} className="text-default-400" />}
              aria-label="Search apps"
              className="flex-1 min-w-[200px]"
              variant="flat"
              classNames={{
                inputWrapper: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none",
                input: "text-sm"
              }}
              endContent={
                searchQuery && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </Button>
                )
              }
            />

            <Select
              placeholder="Filter by Server"
              selectedKeys={serverFilter ? new Set([serverFilter]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                setServerFilter(value && value !== 'all' ? value : undefined)
              }}
              items={[
                { key: 'all', label: 'All Servers' },
                ...servers.map((server) => ({ key: server.id, label: server.ip || server.host || server.id }))
              ]}
              className="w-[180px]"
              variant="flat"
              classNames={{
                trigger: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none"
              }}
              aria-label="Filter by server"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Select
              placeholder="Filter by Created By"
              selectedKeys={createdByFilter ? new Set([createdByFilter]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                setCreatedByFilter(value && value !== 'all' ? value : undefined)
              }}
              items={[
                { key: 'all', label: 'All Creators' },
                ...createdByOptions.map((creator) => ({ key: creator, label: creator }))
              ]}
              className="w-[180px]"
              variant="flat"
              classNames={{
                trigger: "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none"
              }}
              aria-label="Filter by created by"
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            {(searchQuery || serverFilter || createdByFilter) && (
              <Button
                variant="light"
                color="danger"
                startContent={<X size={16} />}
                onPress={() => {
                  setSearchQuery('')
                  setServerFilter(undefined)
                  setCreatedByFilter(undefined)
                }}
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
            aria-label="Apps table"
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
              items={apps}
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
                  title={(searchQuery || serverFilter || createdByFilter) ? 'No applications found' : 'No applications found'}
                  description={(searchQuery || serverFilter || createdByFilter) ? "Try adjusting your filters to see more results." : "Add an application to start tracking deployments."}
                  actionLabel={(searchQuery || serverFilter || createdByFilter) ? undefined : "New Application"}
                  onAction={(searchQuery || serverFilter || createdByFilter) ? undefined : () => navigate('/apps/new')}
                  icon={Package}
                />
              }
            >
              {(app) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app.id)}>
                  {(columnKey) => (
                    <TableCell align="center">{renderCell(app, columnKey as string)}</TableCell>
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

export default AppListPage

