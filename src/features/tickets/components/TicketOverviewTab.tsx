import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Skeleton, Chip, Button, Divider, Tooltip, Link } from '@heroui/react'
import { ExternalLink, File, Download, User as UserIcon, Copy, Check, Server, Activity, Database } from 'lucide-react'
import { useTicket } from '../hooks/useTicket'
import {
  TICKET_TYPE_LABELS,
  TICKET_ENVIRONMENT_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  getTicketStatusColor,
  getTicketPriorityColor,
} from '../constants'
import { parseLinks, pbFilesUrls } from '../utils'
import { copyToClipboard } from '@/lib/utils/clipboard'

interface TicketOverviewTabProps {
  ticketId?: string
}

function TicketOverviewTab({ ticketId }: TicketOverviewTabProps) {
  const { ticket, loading, error } = useTicket(ticketId)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">Error loading ticket: {error.message}</p>
        </CardBody>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardBody>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Skeleton className="h-32 w-full rounded" />
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!ticket) {
    return (
      <Card>
        <CardBody>
          <p className="text-default-500">Ticket not found</p>
        </CardBody>
      </Card>
    )
  }

  const links = parseLinks(ticket.links)
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

  // Parse requirements from description (simple pattern matching)
  const parseRequirements = () => {
    const desc = ticket.description || ''
    const requirements: {
      ports?: string[]
      healthCheck?: string
      volumes?: string[]
      envDoc?: string
    } = {}

    // Extract ports (e.g., "Port: 8080, 3000" or "Ports: 8080")
    const portMatch = desc.match(/(?:port|ports)[:\s]+([0-9,\s]+)/i)
    if (portMatch) {
      requirements.ports = portMatch[1].split(',').map(p => p.trim()).filter(Boolean)
    }

    // Extract health check endpoint
    const healthMatch = desc.match(/(?:health|healthcheck|health\s+endpoint)[:\s]+([\/\w-]+)/i)
    if (healthMatch) {
      requirements.healthCheck = healthMatch[1]
    }

    // Extract volumes
    const volumeMatch = desc.match(/(?:volume|volumes)[:\s]+([\/\w\s,]+)/i)
    if (volumeMatch) {
      requirements.volumes = volumeMatch[1].split(',').map(v => v.trim()).filter(Boolean)
    }

    // Extract env doc link
    const envDocMatch = desc.match(/(?:env\s+doc|environment\s+doc)[:\s]+(https?:\/\/[^\s]+)/i)
    if (envDocMatch) {
      requirements.envDoc = envDocMatch[1]
    }

    return requirements
  }

  const requirements = parseRequirements()
  const healthEndpoint = requirements.healthCheck || '/health'
  const expectedStatusCode = '200'

  const handleCopyUrl = async (url: string) => {
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    }
  }

  // Helper component for Key-Value display
  const KeyValue = ({ label, value, truncate = false }: { label: string; value: string | React.ReactNode; truncate?: boolean }) => {
    const isString = typeof value === 'string'
    const valueContent = truncate && isString ? (
      <Tooltip content={value}>
        <span className="font-medium text-default-900 truncate block">{value}</span>
      </Tooltip>
    ) : isString ? (
      <span className="font-medium text-default-900">{value}</span>
    ) : (
      <div className="font-medium text-default-900">{value}</div>
    )

    return (
      <div className="py-2">
        <dt className="text-sm text-default-500 mb-1">{label}</dt>
        <dd>{valueContent}</dd>
      </div>
    )
  }

  // Helper component for User display
  const UserDisplay = ({ name, subtitle }: { name: string; subtitle?: string }) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center">
        <UserIcon size={16} className="text-default-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-default-900 truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-default-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left: Description + Requirements + Verification + Links + Attachments (col-span-2) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Description Section */}
        <div className="space-y-1 px-1">
          <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400">Description</p>
          <div className="text-default-700 whitespace-pre-wrap text-sm leading-relaxed font-medium">
            {ticket.description || 'No description provided.'}
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4 pt-4 border-t border-divider">
          <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 px-1">Requirements</p>
          <div className="grid grid-cols-1 gap-6 px-1">
            {requirements.ports && requirements.ports.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Server size={14} className="text-primary" />
                  <span className="text-xs font-bold text-default-600 uppercase">Ports</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {requirements.ports.map((port, idx) => (
                    <code key={idx} className="bg-default-100 text-primary text-[11px] px-2 py-0.5 rounded-sm font-bold border border-primary/10">
                      {port}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-primary" />
                <span className="text-xs font-bold text-default-600 uppercase">Health Check</span>
              </div>
              <p className="text-sm text-default-700 ml-6 font-medium">
                {requirements.healthCheck || 'Not specified'}
              </p>
            </div>

            {requirements.volumes && requirements.volumes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database size={14} className="text-primary" />
                  <span className="text-xs font-bold text-default-600 uppercase">Volumes</span>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  {requirements.volumes.map((volume, idx) => (
                    <li key={idx} className="text-xs text-default-700 font-mono font-bold italic">
                      {volume}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-divider">
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 px-1">Attachments</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
              {pbFilesUrls('ma_tickets', ticket.id, ticket.attachments).map(
                (url, index) => {
                  const fileName = ticket.attachments?.[index] || `file-${index}`
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 rounded bg-default-100/30 border border-divider/50 hover:bg-default-100 transition-colors group cursor-pointer">
                      <File size={16} className="text-default-400 group-hover:text-primary flex-shrink-0" />
                      <span className="flex-1 truncate text-xs font-bold text-default-700">{fileName}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          as="a"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 w-6 min-w-0"
                        >
                          <ExternalLink size={12} />
                        </Button>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}
      </div>

      {/* Column 3: Summary (col-span-1) */}
      <div className="lg:col-span-1 border-l border-divider px-4 space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 mb-3">Summary</p>
          <dl className="space-y-4">
            <KeyValue
              label="CODE"
              value={
                <code className="text-primary font-bold text-xs tracking-tight">
                  {ticket.code || 'N/A'}
                </code>
              }
            />
            <KeyValue label="TYPE" value={
              <Chip size="sm" variant="flat" color="primary" className="font-black text-[10px] uppercase h-5">
                {TICKET_TYPE_LABELS[ticket.type] || ticket.type || 'N/A'}
              </Chip>
            } />
            <KeyValue label="APPLICATION" value={<span className="font-bold text-xs text-foreground">{ticket.app_name || 'N/A'}</span>} truncate={true} />
            <KeyValue label="SERVICE TAGS" value={
              Array.isArray(ticket.service_tags) && ticket.service_tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {ticket.service_tags.map((tag) => (
                    <Chip key={tag} size="sm" variant="dot" color="primary" className="text-[10px] h-5 font-bold">
                      {tag}
                    </Chip>
                  ))}
                </div>
              ) : (
                <span className="text-default-400 text-xs italic">none</span>
              )
            } />
          </dl>
        </div>
      </div>

      {/* Column 4: Quick Info (col-span-1) */}
      <div className="lg:col-span-1 border-l border-divider px-4 space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 mb-3">Quick Info</p>
          <div className="space-y-6">
            <div className="space-y-4">
              <KeyValue
                label="STATUS"
                value={
                  <Chip
                    size="sm"
                    variant="dot"
                    color={getTicketStatusColor(ticket.status)}
                    className="font-black text-[10px] uppercase h-5"
                  >
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </Chip>
                }
              />
              <KeyValue
                label="PRIORITY"
                value={
                  <Chip
                    size="sm"
                    variant="flat"
                    color={getTicketPriorityColor(ticket.priority)}
                    className="font-black text-[10px] uppercase h-5"
                  >
                    {TICKET_PRIORITY_LABELS[ticket.priority]}
                  </Chip>
                }
              />
              <KeyValue
                label="ENVIRONMENT"
                value={
                  <Chip size="sm" variant="flat" color="default" className="font-black text-[10px] uppercase h-5">
                    {TICKET_ENVIRONMENT_LABELS[ticket.environment]}
                  </Chip>
                }
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-divider/50">
              <KeyValue
                label="ASSIGNEE"
                value={ticket.assignee ? <UserDisplay name={ticket.assignee} /> : <span className="text-default-400 text-xs italic">Unassigned</span>}
              />
              <KeyValue
                label="REQUESTER"
                value={ticket.requester_name ? (
                  <UserDisplay
                    name={ticket.requester_name}
                    subtitle={ticket.requester_contact || undefined}
                  />
                ) : <span className="text-default-400 text-xs italic">N/A</span>}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-divider/50">
              <KeyValue label="DUE DATE" value={<span className="text-xs font-bold text-foreground">{ticket.due_at ? formatDate(ticket.due_at) : 'NOT SET'}</span>} />
              <KeyValue label="STARTED" value={<span className="text-xs font-bold text-foreground">{ticket.started_at ? formatDate(ticket.started_at) : 'NOT STARTED'}</span>} />
              <KeyValue label="RESOLVED" value={<span className="text-xs font-bold text-foreground">{ticket.resolved_at ? formatDate(ticket.resolved_at) : 'NOT RESOLVED'}</span>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketOverviewTab
