import React from 'react'
import { Card, CardBody, Skeleton, Chip, Tooltip, Button } from '@heroui/react'
import { File, ExternalLink, Server, Activity, Database, Link as LinkIcon } from 'lucide-react'
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

interface TicketOverviewTabProps {
  ticketId?: string
}

function TicketOverviewTab({ ticketId }: TicketOverviewTabProps) {
  const { ticket, loading, error } = useTicket(ticketId)

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
              <Skeleton className="h-4 w-full rounded bg-content1" />
              <Skeleton className="h-4 w-3/4 rounded bg-content1" />
              <Skeleton className="h-4 w-1/2 rounded bg-content1" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Skeleton className="h-32 w-full rounded bg-content1" />
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

  const links = parseLinks(ticket.link)
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
        <div className="text-default-500 text-[10px] font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
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

        {/* Links Section */}
        {links.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-divider">
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 px-1">Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded bg-default-100/30 border border-divider/50 hover:bg-default-100 transition-colors group cursor-pointer">
                  <LinkIcon size={16} className="text-default-400 group-hover:text-primary flex-shrink-0" />
                  <span className="flex-1 truncate text-xs font-bold text-default-700">{link.label || link.url}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      as="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-6 w-6 min-w-0"
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {ticket.attachments && (ticket.attachments as string[]).length > 0 && (
          <div className="space-y-2 pt-4 border-t border-divider">
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 px-1">Attachments</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
              {pbFilesUrls('ma_tickets', ticket.id, ticket.attachments as string[]).map(
                (url, index) => {
                  const fileName = (ticket.attachments as string[])?.[index] || `file-${index}`
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

      {/* Column 3: Summary + Timeline */}
      <div className="lg:col-span-1 space-y-4">
        <Card shadow="none" className="border border-divider bg-content1">
          <CardBody>
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
              <KeyValue
                label="TYPE"
                value={
                  <Chip size="sm" variant="flat" color="primary" className="font-black text-[10px] uppercase h-5">
                    {TICKET_TYPE_LABELS[ticket.types] || ticket.types || 'N/A'}
                  </Chip>
                }
              />
              <KeyValue label="APPLICATION" value={<span className="font-bold text-xs text-foreground">{ticket.app_name || 'N/A'}</span>} truncate={true} />
              <KeyValue
                label="SERVICE TAGS"
                value={
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
                }
              />
            </dl>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-divider bg-content1">
          <CardBody>
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 mb-3">Timeline</p>
            <div className="space-y-3">
              <KeyValue label="DUE DATE" value={<span className="text-xs font-bold text-foreground">{ticket.due_at ? formatDate(ticket.due_at) : 'NOT SET'}</span>} />
              <KeyValue label="STARTED" value={<span className="text-xs font-bold text-foreground">{ticket.started_at ? formatDate(ticket.started_at) : 'NOT STARTED'}</span>} />
              <KeyValue label="RESOLVED" value={<span className="text-xs font-bold text-foreground">{ticket.resolved_at ? formatDate(ticket.resolved_at) : 'NOT RESOLVED'}</span>} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Column 4: Status + People */}
      <div className="lg:col-span-1 space-y-4">
        <Card shadow="none" className="border border-divider bg-content1">
          <CardBody>
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 mb-3">Status</p>
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
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-divider bg-content1">
          <CardBody>
            <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-default-400 mb-3">People</p>
            <div className="space-y-4">
              <KeyValue
                label="ASSIGNEE"
                value={ticket.assignee ? <UserDisplay name={ticket.assignee} /> : <span className="text-default-400 text-xs italic">Unassigned</span>}
              />
              <KeyValue
                label="REQUESTOR"
                value={ticket.requestor_name ? (
                  <UserDisplay
                    name={ticket.requestor_name}
                    subtitle={ticket.requestor_contact || undefined}
                  />
                ) : <span className="text-default-400 text-xs italic">N/A</span>}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default TicketOverviewTab
