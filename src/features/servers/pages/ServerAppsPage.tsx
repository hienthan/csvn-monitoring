import { useParams } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Skeleton,
  Chip,
} from '@heroui/react'
import { useServerApps } from '../hooks/useServerApps'
import type { ServerApp } from '@/features/apps/types'

function ServerAppsPage() {
  const { serverId } = useParams()
  const { apps, loading, error } = useServerApps(serverId)

  const columns = [
    { key: 'name', label: 'NAME' },
    { key: 'port', label: 'PORT' },
    { key: 'version', label: 'VERSION' },
    { key: 'status', label: 'STATUS' },
    { key: 'updated', label: 'LAST UPDATED' },
    { key: 'created_by', label: 'CREATED BY' },
  ]

  const renderCell = (app: ServerApp, columnKey: string) => {
    const appDetails = app.expand?.app as any

    switch (columnKey) {
      case 'name':
        const appId = (appDetails as any)?.id || app.id
        return (
          <div className="flex items-center justify-center">
            {appId ? (
              <a
                href={`/apps/${appId}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-primary hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {app.name || appDetails?.name || 'N/A'}
              </a>
            ) : (
              <span className="font-bold text-foreground">
                {app.name || appDetails?.name || 'N/A'}
              </span>
            )}
          </div>
        )
      case 'port':
        return (
          <div className="flex justify-center">
            <span className="font-mono text-primary font-bold px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
              {(app as any).port || appDetails?.port || '—'}
            </span>
          </div>
        )
      case 'version':
        return (
          <div className="flex justify-center">
            <Chip size="sm" variant="flat" className="font-mono text-xs">
              {appDetails?.version || 'v0.0.0'}
            </Chip>
          </div>
        )
      case 'status':
        const isOnline = app.status?.toLowerCase() === 'online' || app.status?.toLowerCase() === 'running'
        return (
          <div className="flex items-center justify-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-default-400'}`} />
            <span className={`text-sm font-medium ${isOnline ? 'text-success' : 'text-default-500'}`}>
              {app.status || 'N/A'}
            </span>
          </div>
        )
      case 'updated':
        return (
          <div className="text-default-500 text-xs text-center font-medium">
            {app.updated ? new Date(app.updated).toLocaleString() : 'N/A'}
          </div>
        )
      case 'created_by':
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-default-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-default-600">
                {(appDetails?.created_by || 'S')[0].toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-primary font-medium">
              {appDetails?.created_by || 'System'}
            </span>
          </div>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <Card shadow="sm" className="border-none bg-danger-50 text-danger p-6">
        <p className="font-medium">Error loading apps: {error.message}</p>
      </Card>
    )
  }

  return (
    <Card shadow="sm" className="border-none bg-content1 overflow-hidden">
      <CardBody className="p-0">
        <Table
          aria-label="Server apps table"
          selectionMode="none"
          removeWrapper
          isStriped
          classNames={{
            base: 'min-h-[300px]',
            th: 'bg-content2 text-default-500 font-black text-[10px] uppercase tracking-wider h-10 px-4 first:rounded-none last:rounded-none border-b border-divider',
            td: 'py-2 px-4 border-b border-divider/50',
            tr: 'hover:bg-content3 transition-colors',
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} align="center">
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={apps}
            isLoading={loading}
            loadingContent={
              <>
                {Array.from({ length: 5 }).map((_, index) => (
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
              <div className="py-20 text-center space-y-2">
                <p className="text-default-500 font-medium">No apps found for this server</p>
                <p className="text-xs text-default-400">All applications will appear here once deployed.</p>
              </div>
            }
          >
            {(app) => (
              <TableRow key={app.id}>
                {(columnKey) => (
                  <TableCell align="center">
                    {renderCell(app, columnKey as string)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default ServerAppsPage

