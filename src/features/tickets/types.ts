// Ticket Type
export type TicketType =
  | 'general'
  | 'deploy_bugfix'
  | 'deploy_feature'
  | 'new_app_setup'
  | 'dockerize'
  | 'env_test_setup'
  | 'db_migration'
  | 'domain_ssl'
  | 'ci_cd'
  | 'monitoring_alert'
  | 'backup_restore'
  | 'access_permission'

// Ticket Priority
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

// Ticket Status
export type TicketStatus =
  | 'new'
  | 'triage'
  | 'in_progress'
  | 'waiting_dev'
  | 'blocked'
  | 'done'
  | 'rejected'

// Ticket Environment
export type TicketEnvironment = 'dev' | 'test' | 'prod'

// Ticket Event Type
export type TicketEventType =
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'unassigned'
  | 'type_changed'
  | 'note'

// Links can be JSON object/array or string (newline-separated URLs)
export type TicketLinks = string | Record<string, unknown> | Array<unknown>

export interface Ticket {
  id: string
  code: string
  title: string
  description: string
  types: TicketType
  priority: TicketPriority
  status: TicketStatus
  environment: TicketEnvironment
  app_name: string
  service_tags: string[]
  requestor_name: string
  requestor_contact?: string
  assignee?: string
  due_at?: string // ISO date string
  started_at?: string // ISO date string
  resolved_at?: string // ISO date string
  attachments?: string[] // PocketBase file field
  link?: TicketLinks // JSON or string
  created?: string
  updated?: string
  [key: string]: unknown
}

export interface TicketComment {
  id: string
  ticket: string // relation id
  author_name: string
  message: string
  attachments?: string[] // PocketBase file field
  created?: string
  updated?: string
  [key: string]: unknown
}

export interface TicketEvent {
  id: string
  ticket: string
  event_type: TicketEventType
  from_value?: string
  to_value?: string
  actor_name: string
  note?: string
  created?: string
  updated?: string
  [key: string]: unknown
}

export interface TicketListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface TicketListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: Ticket[]
}

export interface TicketCommentListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface TicketCommentListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: TicketComment[]
}

export interface TicketEventListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface TicketEventListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: TicketEvent[]
}
