import type {
  TicketStatus,
  TicketPriority,
  TicketType,
  TicketEnvironment,
  TicketEventType,
} from '@/features/tickets/types'
import type { ChipProps } from '@heroui/react'

// Label maps
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'New',
  triage: 'Triage',
  in_progress: 'In Progress',
  waiting_dev: 'Waiting Dev',
  blocked: 'Blocked',
  done: 'Done',
  rejected: 'Rejected',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  general: 'General',
  deploy_bugfix: 'Deploy Bugfix',
  deploy_feature: 'Deploy Feature',
  new_app_setup: 'New App Setup',
  dockerize: 'Dockerize',
  env_test_setup: 'Env Test Setup',
  db_migration: 'DB Migration',
  domain_ssl: 'Domain SSL',
  ci_cd: 'CI/CD',
  monitoring_alert: 'Monitoring Alert',
  backup_restore: 'Backup Restore',
  access_permission: 'Access Permission',
}

export const TICKET_ENVIRONMENT_LABELS: Record<TicketEnvironment, string> = {
  dev: 'Dev',
  test: 'Test',
  staging: 'Staging',
  prod: 'Prod',
}

// Chip colorVariant maps (using HeroUI color prop)
// HeroUI colors: default, primary, secondary, success, warning, danger
export const TICKET_STATUS_COLORS: Record<TicketStatus, ChipProps['color']> = {
  new: 'primary',
  triage: 'secondary',
  in_progress: 'success',
  waiting_dev: 'warning',
  blocked: 'danger',
  done: 'default',
  rejected: 'danger',
}

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  normal: 'default',
  high: 'warning',
  urgent: 'danger',
}

export const TICKET_EVENT_TYPE_COLORS: Record<TicketEventType, ChipProps['color']> = {
  status_changed: 'primary',
  priority_changed: 'warning',
  type_changed: 'secondary',
  assigned: 'primary',
  unassigned: 'default',
  note: 'default',
}

// Service tag options (predefined + allow free input)
export const SERVICE_TAG_OPTIONS = [
  'docker',
  'mysql',
  'nginx',
  'network',
  'ssl',
  'ci',
] as const

export type ServiceTagOption = (typeof SERVICE_TAG_OPTIONS)[number]

// Helper functions
export function getTicketStatusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status] || status
}

export function getTicketPriorityLabel(priority: TicketPriority): string {
  return TICKET_PRIORITY_LABELS[priority] || priority
}

export function getTicketTypeLabel(type: TicketType): string {
  return TICKET_TYPE_LABELS[type] || type
}

export function getTicketEnvironmentLabel(environment: TicketEnvironment): string {
  return TICKET_ENVIRONMENT_LABELS[environment] || environment
}

export function getTicketStatusColor(status: TicketStatus): ChipProps['color'] {
  return TICKET_STATUS_COLORS[status] || 'default'
}

export function getTicketPriorityColor(priority: TicketPriority): 'default' | 'warning' | 'danger' {
  return TICKET_PRIORITY_COLORS[priority] || 'default'
}

export function getTicketEventTypeColor(eventType: TicketEventType): ChipProps['color'] {
  return TICKET_EVENT_TYPE_COLORS[eventType] || 'default'
}
