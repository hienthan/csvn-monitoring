import React from 'react'
import { Card, CardBody, Skeleton, Chip, Tooltip, Button } from '@heroui/react'
import { File, ExternalLink, Link as LinkIcon } from 'lucide-react'
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

import type { Ticket } from '../types'

interface TicketOverviewTabProps {
  ticketId?: string
  ticket?: Ticket | null
  showSidebar?: boolean
}

function TicketOverviewTab({ ticketId, ticket: ticketProp, showSidebar = true }: TicketOverviewTabProps) {
  const shouldFetch = !ticketProp && !!ticketId
  const { ticket: fetchedTicket, loading, error } = useTicket(shouldFetch ? ticketId : undefined)
  const ticket = ticketProp || fetchedTicket

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


  // Helper component for Key-Value display
  const KeyValue = ({
    label,
    value,
    truncate = false,
  }: {
    label: string
    value: string | React.ReactNode
    truncate?: boolean
  }) => {
    const isString = typeof value === 'string'
    const valueContent = truncate && isString ? (
      <Tooltip content={value}>
        <span className="text-sm text-default-900 truncate block">{value}</span>
      </Tooltip>
    ) : isString ? (
      <span className="text-sm text-default-900">{value}</span>
    ) : (
      <div className="text-sm text-default-900">{value}</div>
    )

    return (
      <div className="py-1">
        <dt className="text-[11px] text-default-500 mb-0.5">{label}</dt>
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
        <p className="font-medium text-primary truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-default-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div >
        <div className="lg:col-span-3">
          <Card shadow="none" className="border-divider border bg-content1/50">
            <CardBody className="p-5">
              <div className="text-default-700 whitespace-pre-wrap text-sm leading-relaxed">
                {ticket.description || 'No description provided.'}
              </div>
            </CardBody>
          </Card>
        </div>

        {showSidebar && (
          <div className="lg:col-span-1">
            <Card shadow="none" className="border-divider border bg-content1/50">
              <CardBody className="p-4 space-y-2">
                <KeyValue label="Code" value={<code className="text-primary text-sm">{ticket.code || 'N/A'}</code>} />
                <KeyValue
                  label="Status"
                  value={
                    <Chip size="sm" variant="dot" color={getTicketStatusColor(ticket.status)} className="text-[11px] h-5">
                      {TICKET_STATUS_LABELS[ticket.status]}
                    </Chip>
                  }
                />
                <KeyValue
                  label="Priority"
                  value={
                    <Chip size="sm" variant="flat" color={getTicketPriorityColor(ticket.priority)} className="text-[11px] h-5">
                      {TICKET_PRIORITY_LABELS[ticket.priority]}
                    </Chip>
                  }
                />
                <KeyValue
                  label="Type"
                  value={
                    <Chip size="sm" variant="flat" color="primary" className="text-[11px] h-5">
                      {TICKET_TYPE_LABELS[ticket.types] || ticket.types || 'N/A'}
                    </Chip>
                  }
                />
                <KeyValue
                  label="Environment"
                  value={
                    <Chip size="sm" variant="flat" color="default" className="text-[11px] h-5">
                      {TICKET_ENVIRONMENT_LABELS[ticket.environment]}
                    </Chip>
                  }
                />
                <KeyValue label="App" value={<span className="text-sm">{ticket.app_name || 'N/A'}</span>} truncate />
                <KeyValue
                  label="Assignee"
                  value={
                    ticket.assignee ? (
                      <UserDisplay name={ticket.assignee} />
                    ) : (
                      <span className="text-default-400 text-sm italic">Unassigned</span>
                    )
                  }
                />
                <KeyValue
                  label="Requestor"
                  value={
                    ticket.requestor_name ? (
                      <UserDisplay name={ticket.requestor_name} subtitle={ticket.requestor_contact || undefined} />
                    ) : (
                      <span className="text-default-400 text-sm italic">N/A</span>
                    )
                  }
                />
                <KeyValue
                  label="Due"
                  value={<span className="text-sm">{ticket.due_at ? formatDate(ticket.due_at) : 'NOT SET'}</span>}
                />
                <KeyValue
                  label="Started"
                  value={<span className="text-sm">{ticket.started_at ? formatDate(ticket.started_at) : 'NOT STARTED'}</span>}
                />
                <KeyValue
                  label="Resolved"
                  value={<span className="text-sm">{ticket.resolved_at ? formatDate(ticket.resolved_at) : 'NOT RESOLVED'}</span>}
                />
                <KeyValue
                  label="Tags"
                  value={
                    Array.isArray(ticket.service_tags) && ticket.service_tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ticket.service_tags.map((tag) => (
                          <Chip key={tag} size="sm" variant="dot" color="primary" className="text-[11px] h-5">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <span className="text-default-400 text-sm italic">none</span>
                    )
                  }
                />
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {(links.length > 0 || (ticket.attachments && (ticket.attachments as string[]).length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          {links.length > 0 && (
            <Card shadow="none" className="border-divider border bg-content1/50 h-full">
              <CardBody className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded bg-default-100/30 border border-divider/50 hover:bg-default-100 transition-colors group cursor-pointer"
                    >
                      <LinkIcon size={16} className="text-default-400 group-hover:text-primary flex-shrink-0" />
                      <span className="flex-1 truncate text-xs text-default-700">
                        {link.label || link.url}
                      </span>
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
              </CardBody>
            </Card>
          )}

          {ticket.attachments && (ticket.attachments as string[]).length > 0 && (
            <Card shadow="none" className="border-divider border bg-content1/50 h-full">
              <CardBody className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pbFilesUrls('ma_tickets', ticket.id, ticket.attachments as string[]).map(
                    (url, index) => {
                      const fileName = (ticket.attachments as string[])?.[index] || `file-${index}`
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded bg-default-100/30 border border-divider/50 hover:bg-default-100 transition-colors group cursor-pointer"
                        >
                          <File size={16} className="text-default-400 group-hover:text-primary flex-shrink-0" />
                          <span className="flex-1 truncate text-xs text-default-700">{fileName}</span>
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
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export function TicketInfoSidebar({ ticket }: { ticket: Ticket }) {
  const KeyValue = ({
    label,
    value,
    truncate = false,
  }: {
    label: string
    value: string | React.ReactNode
    truncate?: boolean
  }) => {
    const isString = typeof value === 'string'
    const valueContent = truncate && isString ? (
      <Tooltip content={value}>
        <span className="text-sm text-default-900 truncate block">{value}</span>
      </Tooltip>
    ) : isString ? (
      <span className="text-sm text-default-900">{value}</span>
    ) : (
      <div className="text-sm text-default-900">{value}</div>
    )

    return (
      <div className="py-1">
        <dt className="text-[11px] text-default-500 mb-0.5">{label}</dt>
        <dd>{valueContent}</dd>
      </div>
    )
  }

  const UserDisplay = ({ name, subtitle }: { name: string; subtitle?: string }) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center">
        <div className="text-default-500 text-[10px] font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-default-900 truncate">{name}</p>
        {subtitle && <p className="text-sm text-default-500 truncate">{subtitle}</p>}
      </div>
    </div>
  )

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

  return (
    <Card shadow="none" className="border-divider border bg-content1/50">
      <CardBody className="p-4 space-y-2">
        <KeyValue label="Code" value={<code className="text-primary text-sm">{ticket.code || 'N/A'}</code>} />
        <KeyValue
          label="Status"
          value={
            <Chip size="sm" variant="dot" color={getTicketStatusColor(ticket.status)} className="text-[11px] h-5">
              {TICKET_STATUS_LABELS[ticket.status]}
            </Chip>
          }
        />
        <KeyValue
          label="Priority"
          value={
            <Chip size="sm" variant="flat" color={getTicketPriorityColor(ticket.priority)} className="text-[11px] h-5">
              {TICKET_PRIORITY_LABELS[ticket.priority]}
            </Chip>
          }
        />
        <KeyValue
          label="Type"
          value={
            <Chip size="sm" variant="flat" color="primary" className="text-[11px] h-5">
              {TICKET_TYPE_LABELS[ticket.types] || ticket.types || 'N/A'}
            </Chip>
          }
        />
        <KeyValue
          label="Environment"
          value={
            <Chip size="sm" variant="flat" color="default" className="text-[11px] h-5">
              {TICKET_ENVIRONMENT_LABELS[ticket.environment]}
            </Chip>
          }
        />
        <KeyValue label="App" value={<span className="text-sm">{ticket.app_name || 'N/A'}</span>} truncate />
        <KeyValue
          label="Assignee"
          value={
            ticket.assignee ? (
              <UserDisplay name={ticket.assignee} />
            ) : (
              <span className="text-default-400 text-sm italic">Unassigned</span>
            )
          }
        />
        <KeyValue
          label="Requestor"
          value={
            ticket.requestor_name ? (
              <UserDisplay name={ticket.requestor_name} subtitle={ticket.requestor_contact || undefined} />
            ) : (
              <span className="text-default-400 text-sm italic">N/A</span>
            )
          }
        />
        <KeyValue
          label="Due"
          value={<span className="text-sm">{ticket.due_at ? formatDate(ticket.due_at) : 'NOT SET'}</span>}
        />
        <KeyValue
          label="Started"
          value={<span className="text-sm">{ticket.started_at ? formatDate(ticket.started_at) : 'NOT STARTED'}</span>}
        />
        <KeyValue
          label="Resolved"
          value={<span className="text-sm">{ticket.resolved_at ? formatDate(ticket.resolved_at) : 'NOT RESOLVED'}</span>}
        />
        <KeyValue
          label="Tags"
          value={
            Array.isArray(ticket.service_tags) && ticket.service_tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {ticket.service_tags.map((tag) => (
                  <Chip key={tag} size="sm" variant="dot" color="primary" className="text-[11px] h-5">
                    {tag}
                  </Chip>
                ))}
              </div>
            ) : (
              <span className="text-default-400 text-sm italic">none</span>
            )
          }
        />
      </CardBody>
    </Card>
  )
}

export default TicketOverviewTab
