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
    const valueContent = truncate ? (
      <Tooltip content={typeof value === 'string' ? value : ''}>
        <p className="font-medium text-default-900 truncate">{value}</p>
      </Tooltip>
    ) : (
      <p className="font-medium text-default-900">{value}</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Description + Attachments (8 columns) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Description Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Description</h2>
          </CardHeader>
          <CardBody>
            <div className="prose max-w-none">
              <p className="text-default-700 whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Requirements Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Requirements</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Ports */}
              {requirements.ports && requirements.ports.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server size={16} className="text-default-500" />
                    <p className="text-sm font-medium text-default-700">Ports</p>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    {requirements.ports.map((port, idx) => (
                      <li key={idx} className="text-sm text-default-600">
                        {port}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server size={16} className="text-default-500" />
                    <p className="text-sm font-medium text-default-700">Ports</p>
                  </div>
                  <p className="text-sm text-default-400 ml-6">Not specified</p>
                </div>
              )}

              {/* Health Check */}
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-default-500" />
                  <p className="text-sm font-medium text-default-700">Health Check</p>
                </div>
                <p className="text-sm text-default-600 ml-6">
                  {requirements.healthCheck || 'Not specified'}
                </p>
              </div>

              {/* Volumes */}
              {requirements.volumes && requirements.volumes.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Database size={16} className="text-default-500" />
                      <p className="text-sm font-medium text-default-700">Volumes</p>
                    </div>
                    <ul className="list-disc list-inside space-y-1 ml-6">
                      {requirements.volumes.map((volume, idx) => (
                        <li key={idx} className="text-sm text-default-600">
                          {volume}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Env Doc Link */}
              {requirements.envDoc && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm font-medium text-default-700 mb-2">Environment Documentation</p>
                    <Link
                      href={requirements.envDoc}
                      isExternal
                      showAnchorIcon
                      className="text-sm"
                    >
                      {requirements.envDoc}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Verification Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Verification</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Health Endpoint */}
              <div>
                <p className="text-sm font-medium text-default-700 mb-2">Health Endpoint</p>
                <div className="flex items-center gap-2 p-2 bg-default-100 rounded">
                  <code className="flex-1 font-mono text-sm text-default-900 break-all">
                    {healthEndpoint}
                  </code>
                  <Tooltip content={copiedUrl === healthEndpoint ? 'Copied!' : 'Copy URL'}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleCopyUrl(healthEndpoint)}
                      aria-label="Copy health endpoint"
                    >
                      {copiedUrl === healthEndpoint ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* Expected Status Code */}
              <div>
                <p className="text-sm font-medium text-default-700 mb-2">Expected Status Code</p>
                <Chip size="sm" variant="flat" color="success">
                  {expectedStatusCode}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Links Card */}
        {links.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Links</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    isExternal
                    showAnchorIcon
                    className="flex items-center gap-2"
                  >
                    {link.label || link.url}
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Attachments Card */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Attachments</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {pbFilesUrls('ma_tickets', ticket.id, ticket.attachments).map(
                  (url, index) => {
                    const fileName = ticket.attachments?.[index] || `file-${index}`
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 hover:bg-default-100 rounded transition-colors"
                      >
                        <File size={16} className="text-default-500 flex-shrink-0" />
                        <span className="flex-1 truncate text-sm">{fileName}</span>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            as="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open file"
                          >
                            <ExternalLink size={14} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            as="a"
                            href={url}
                            download
                            aria-label="Download file"
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Right: Summary + Quick Info (4 columns) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Summary</h2>
          </CardHeader>
          <CardBody>
            <dl className="space-y-0">
              <KeyValue 
                label="Code" 
                value={ticket.code || 'N/A'} 
                truncate={true}
              />
              <Divider className="my-2" />
              <KeyValue label="Type" value={
                <Chip size="sm" variant="flat" color="default">
                  {TICKET_TYPE_LABELS[ticket.type] || ticket.type || 'N/A'}
                </Chip>
              } />
              <Divider className="my-2" />
              <KeyValue label="App Name" value={ticket.app_name || 'N/A'} truncate={true} />
              <Divider className="my-2" />
              <KeyValue label="Service Tags" value={
                ticket.service_tags && ticket.service_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {ticket.service_tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="flat" color="primary">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <span className="text-default-400 text-sm">None</span>
                )
              } />
            </dl>
          </CardBody>
        </Card>

        {/* Quick Info Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick Info</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Status, Priority, Environment */}
              <div className="space-y-2">
                {ticket.status && (
                  <div>
                    <p className="text-sm text-default-500 mb-1">Status</p>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getTicketStatusColor(ticket.status)}
                    >
                      {TICKET_STATUS_LABELS[ticket.status]}
                    </Chip>
                  </div>
                )}
                {ticket.priority && (
                  <div>
                    <p className="text-sm text-default-500 mb-1">Priority</p>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getTicketPriorityColor(ticket.priority)}
                    >
                      {TICKET_PRIORITY_LABELS[ticket.priority]}
                    </Chip>
                  </div>
                )}
                {ticket.environment && (
                  <div>
                    <p className="text-sm text-default-500 mb-1">Environment</p>
                    <Chip size="sm" variant="flat" color="default">
                      {TICKET_ENVIRONMENT_LABELS[ticket.environment]}
                    </Chip>
                  </div>
                )}
              </div>

              <Divider />

              {/* Assignee */}
              <div>
                <p className="text-sm text-default-500 mb-2">Assignee</p>
                {ticket.assignee ? (
                  <UserDisplay name={ticket.assignee} />
                ) : (
                  <span className="text-default-400 text-sm">Unassigned</span>
                )}
              </div>

              <Divider />

              {/* Requester */}
              <div>
                <p className="text-sm text-default-500 mb-2">Requester</p>
                {ticket.requester_name ? (
                  <UserDisplay 
                    name={ticket.requester_name} 
                    subtitle={ticket.requester_contact}
                  />
                ) : (
                  <span className="text-default-400 text-sm">N/A</span>
                )}
              </div>

              <Divider />

              {/* Dates */}
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-default-500 mb-1">Due Date</p>
                  <p className="text-sm font-medium text-default-900">
                    {ticket.due_at ? formatDate(ticket.due_at) : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Started At</p>
                  <p className="text-sm font-medium text-default-900">
                    {ticket.started_at ? formatDate(ticket.started_at) : 'Not started'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Resolved At</p>
                  <p className="text-sm font-medium text-default-900">
                    {ticket.resolved_at ? formatDate(ticket.resolved_at) : 'Not resolved'}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default TicketOverviewTab
