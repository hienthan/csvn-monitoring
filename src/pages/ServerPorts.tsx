import { useState } from 'react'
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
  Button,
} from '@heroui/react'
import { ChevronRight, Copy, Check } from 'lucide-react'
import { useServerPorts } from '@/lib/hooks/useServerPorts'
import { copyToClipboard } from '@/lib/utils/clipboard'
import type { ServerPort, ServerAppRelation } from '@/types/port'

function ServerPorts() {
  const { serverId } = useParams()
  const { ports, loading, error } = useServerPorts(serverId)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const handleExpand = (portId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedRow(expandedRow === portId ? null : portId)
  }

  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedValue(text)
      setTimeout(() => setCopiedValue(null), 2000)
    }
  }

  const handleKeyDown = (
    portId: string,
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      setExpandedRow(expandedRow === portId ? null : portId)
    }
  }

  const getAppInfo = (port: ServerPort): ServerAppRelation | null => {
    if (!port.app) return null
    if (typeof port.app === 'string') return null
    return port.app as ServerAppRelation
  }

  const columns = [
    { key: 'expand', label: '' },
    { key: 'port', label: 'Port' },
    { key: 'protocol', label: 'Protocol' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' },
  ]

  const renderCell = (port: ServerPort, columnKey: string) => {
    switch (columnKey) {
      case 'expand':
        return (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="min-w-0"
            onClick={(e) => handleExpand(port.id, e)}
            onKeyDown={(e) => handleKeyDown(port.id, e)}
            aria-label={expandedRow === port.id ? 'Collapse row' : 'Expand row'}
            aria-expanded={expandedRow === port.id}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                expandedRow === port.id ? 'rotate-90' : ''
              }`}
            />
          </Button>
        )
      case 'port':
        return (
          <div className="font-medium text-foreground font-mono">
            {port.port || 'N/A'}
          </div>
        )
      case 'protocol':
        return (
          <div className="text-default-600 uppercase text-sm">
            {port.protocol || 'N/A'}
          </div>
        )
      case 'status':
        return (
          <div className="text-default-600">{port.status || 'N/A'}</div>
        )
      case 'description':
        return (
          <div className="text-default-600">{port.description || 'N/A'}</div>
        )
      default:
        return null
    }
  }

  const renderExpandedContent = (port: ServerPort) => {
    const appInfo = getAppInfo(port)

    return (
      <div className="px-4 py-3 bg-default-50 border-t border-divider">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Related App Info */}
          {appInfo && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-default-700">
                Related App
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-default-500">Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{appInfo.name || 'N/A'}</span>
                    {appInfo.name && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="min-w-0 h-6 w-6"
                        onClick={(e) => handleCopy(appInfo.name || '', e)}
                        aria-label="Copy app name"
                      >
                        {copiedValue === appInfo.name ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {appInfo.path && (
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Path:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {appInfo.path}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="min-w-0 h-6 w-6"
                        onClick={(e) => handleCopy(appInfo.path || '', e)}
                        aria-label="Copy app path"
                      >
                        {copiedValue === appInfo.path ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service & Container Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-default-700">
              Service Info
            </h4>
            <div className="space-y-1 text-sm">
              {port.service_name && (
                <div className="flex items-center justify-between">
                  <span className="text-default-500">Service:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{port.service_name}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-0 h-6 w-6"
                      onClick={(e) => handleCopy(port.service_name || '', e)}
                      aria-label="Copy service name"
                    >
                      {copiedValue === port.service_name ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {port.container_name && (
                <div className="flex items-center justify-between">
                  <span className="text-default-500">Container:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{port.container_name}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-0 h-6 w-6"
                      onClick={(e) => handleCopy(port.container_name || '', e)}
                      aria-label="Copy container name"
                    >
                      {copiedValue === port.container_name ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Port Mapping */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-default-700">
              Port Mapping
            </h4>
            <div className="space-y-1 text-sm">
              {port.internal_port && (
                <div className="flex items-center justify-between">
                  <span className="text-default-500">Internal:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{port.internal_port}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-0 h-6 w-6"
                      onClick={(e) => handleCopy(String(port.internal_port), e)}
                      aria-label="Copy internal port"
                    >
                      {copiedValue === String(port.internal_port) ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {port.external_port && (
                <div className="flex items-center justify-between">
                  <span className="text-default-500">External:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{port.external_port}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-0 h-6 w-6"
                      onClick={(e) => handleCopy(String(port.external_port), e)}
                      aria-label="Copy external port"
                    >
                      {copiedValue === String(port.external_port) ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {port.port && (
                <div className="flex items-center justify-between">
                  <span className="text-default-500">Port:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{port.port}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-0 h-6 w-6"
                      onClick={(e) => handleCopy(String(port.port), e)}
                      aria-label="Copy port"
                    >
                      {copiedValue === String(port.port) ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">Error loading ports: {error.message}</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-0">
        <Table
          aria-label="Server ports table"
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
            items={ports}
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
                <p className="text-default-500">No ports found for this server</p>
              </div>
            }
          >
            {(port) => (
              <>
                <TableRow key={port.id}>
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(port, columnKey as string)}
                    </TableCell>
                  )}
                </TableRow>
                {expandedRow === port.id && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      {renderExpandedContent(port)}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default ServerPorts
