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
  Chip,
} from '@heroui/react'
import { Copy, Check, Network } from 'lucide-react'
import { useServerPorts } from '../hooks/useServerPorts'
import { copyToClipboard } from '@/lib/utils/clipboard'
import type { ServerPort } from '@/types/port'

function ServerPortsPage() {
  const { serverId } = useParams()
  const { ports, loading, error } = useServerPorts(serverId)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedValue(text)
      setTimeout(() => setCopiedValue(null), 2000)
    }
  }

  const columns = [
    { key: 'port', label: 'PORT' },
    { key: 'protocol', label: 'PROTOCOL' },
    { key: 'service', label: 'SERVICE' },
    { key: 'internal_port', label: 'INTERNAL' },
    { key: 'external_port', label: 'EXTERNAL' },
    { key: 'status', label: 'STATUS' },
  ]

  const renderCell = (port: ServerPort, columnKey: string) => {
    switch (columnKey) {
      case 'port':
        return (
          <div className="flex items-center gap-2 group">
            <span className="font-bold text-foreground font-mono">
              {port.port || 'N/A'}
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 min-w-0"
              onClick={(e) => handleCopy(String(port.port), e)}
            >
              {copiedValue === String(port.port) ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            </Button>
          </div>
        )
      case 'protocol':
        return (
          <Chip size="sm" variant="flat" className="font-mono text-[10px] uppercase font-bold">
            {port.protocol || 'TCP'}
          </Chip>
        )
      case 'service':
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {port.service_name || 'N/A'}
            </span>
            {port.container_name && (
              <span className="text-[10px] text-default-400 truncate max-w-[150px]">
                {port.container_name}
              </span>
            )}
          </div>
        )
      case 'internal_port':
        return (
          <span className="font-mono text-sm text-default-600">
            {port.internal_port || '-'}
          </span>
        )
      case 'external_port':
        return (
          <span className="font-mono text-sm font-bold text-primary">
            {port.external_port || '-'}
          </span>
        )
      case 'status':
        const isListening = port.status?.toLowerCase() === 'listening' || port.status?.toLowerCase() === 'active'
        return (
          <Chip
            size="sm"
            variant="dot"
            color={isListening ? 'success' : 'default'}
            className="border-none bg-transparent h-6"
          >
            {port.status || 'N/A'}
          </Chip>
        )
      default:
        return null
    }
  }

  if (error) {
    return (
      <Card shadow="sm" className="border-none bg-danger-50 text-danger p-6">
        <p className="font-medium">Error loading ports: {error.message}</p>
      </Card>
    )
  }

  return (
    <Card shadow="sm" className="border-none bg-content1 overflow-hidden">
      <CardBody className="p-0">
        <Table
          aria-label="Server ports table"
          selectionMode="none"
          removeWrapper
          isStriped
          classNames={{
            base: "min-h-[300px]",
            th: "bg-content2 text-default-500 font-black text-[10px] uppercase tracking-wider h-10 px-4 first:rounded-none last:rounded-none border-b border-divider",
            td: "py-2 px-4 border-b border-divider/50",
            tr: "hover:bg-content3 transition-colors",
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>
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
                        <Skeleton className="h-5 w-full rounded bg-content1" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            }
            emptyContent={
              <div className="py-20 text-center space-y-2">
                <Network className="w-10 h-10 text-default-300 mx-auto" />
                <p className="text-default-500 font-medium">No active ports detected</p>
                <p className="text-xs text-default-400">Listening ports will appear here once identified.</p>
              </div>
            }
          >
            {(port) => (
              <TableRow key={port.id}>
                {(columnKey) => (
                  <TableCell>
                    {renderCell(port, String(columnKey))}
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

export default ServerPortsPage
