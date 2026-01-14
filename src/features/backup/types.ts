import type { ServerApp } from '@/features/apps/types'
import type { Server } from '@/features/servers/types'

export type BackupTargetType = 'db_dump' | 'filesystem' | 'docker_volume' | 'docker_container_optional'
export type BackupScheduleType = 'cron' | 'daily' | 'weekly' | 'manual_only'
export type BackupStorageBackend = 'local_fs' | 'nas' | 's3' | 'remote'
export type BackupCompression = 'none' | 'gzip' | 'zstd'
export type BackupStatus = 'success' | 'failed' | 'running' | 'skipped'
export type BackupHealthKey = 'disabled' | 'running' | 'failed' | 'overdue' | 'healthy' | 'unknown'
export type BackupTriggeredBy = 'scheduler' | 'manual' | 'api'

export interface BackupMeta {
  category?: string
  [key: string]: unknown
}

export interface Backup {
  id: string
  collectionId?: string
  collectionName?: string
  
  // Relations
  app_id: string
  server_id: string
  
  // Identity
  name: string
  description?: string
  
  // Target
  target_type: BackupTargetType
  source_ref?: string
  backup_script?: string
  pre_hook_script?: string
  post_hook_script?: string
  
  // Schedule
  schedule_type: BackupScheduleType
  schedule_spec?: string
  timezone?: string
  next_due_at?: string
  grace_minutes?: number
  
  // Storage & Retention
  storage_backend?: BackupStorageBackend
  storage_path_template?: string
  retention_keep_days?: number
  retention_keep_last_n?: number
  compression?: BackupCompression
  encryption?: boolean
  
  // Status
  last_run_at?: string
  last_status?: BackupStatus
  last_success_at?: string
  last_duration_ms?: number
  last_backup_size_bytes?: number
  last_artifact_path?: string
  last_exit_code?: number
  last_error_summary?: string
  last_log_path?: string
  
  // Control
  is_enabled?: boolean
  last_triggered_by?: BackupTriggeredBy
  last_triggered_user_id?: string
  script_version?: string
  meta?: BackupMeta | string
  
  // Expand relations
  expand?: {
    app_id?: ServerApp
    server_id?: Server
    last_triggered_user_id?: {
      id: string
      username?: string
      name?: string
    }
  }
  
  created?: string
  updated?: string
  [key: string]: unknown
}

export interface BackupHealth {
  key: BackupHealthKey
  label: string
  severity: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export interface BackupListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface BackupListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: Backup[]
}

export interface BackupSummary {
  total: number
  healthy: number
  overdue: number
  failed: number
  disabled: number
  running: number
}
