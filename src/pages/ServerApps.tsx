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
} from '@heroui/react'
import { useServerApps } from '@/lib/hooks/useServerApps'
import type { ServerApp } from '@/types/app'

function ServerApps() {
  const { serverId } = useParams()
  const { apps, loading, error } = useServerApps(serverId)

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'path', label: 'Path' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' },
  ]

  const renderCell = (app: ServerApp, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="font-medium text-foreground">{app.name || 'N/A'}</div>
        )
      case 'path':
        return (
          <div className="text-default-600 font-mono text-sm">
            {app.path || 'N/A'}
          </div>
        )
      case 'status':
        return (
          <div className="text-default-600">{app.status || 'N/A'}</div>
        )
      case 'description':
        return (
          <div className="text-default-600">{app.description || 'N/A'}</div>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">Error loading apps: {error.message}</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-0">
        <Table
          aria-label="Server apps table"
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
            items={apps}
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
                <p className="text-default-500">No apps found for this server</p>
              </div>
            }
          >
            {(app) => (
              <TableRow key={app.id}>
                {(columnKey) => (
                  <TableCell>
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

export default ServerApps

