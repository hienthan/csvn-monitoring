import type { Backup, BackupHealth, BackupHealthKey, BackupSummary } from '../types'

/**
 * Get backup health status following precedence:
 * Disabled > Running > Failed > Overdue > Healthy > Unknown
 */
export function getBackupHealth(backup: Backup): BackupHealth {
  const now = new Date()
  
  // 1. Disabled (highest precedence)
  if (backup.is_enabled === false) {
    return {
      key: 'disabled',
      label: 'Disabled',
      severity: 'default',
    }
  }
  
  // 2. Running
  if (backup.last_status === 'running') {
    return {
      key: 'running',
      label: 'Running',
      severity: 'primary',
    }
  }
  
  // 3. Failed
  if (backup.last_status === 'failed') {
    return {
      key: 'failed',
      label: 'Failed',
      severity: 'danger',
    }
  }
  
  // 4. Overdue
  if (backup.is_enabled !== false && backup.next_due_at) {
    const dueDate = new Date(backup.next_due_at)
    if (now > dueDate) {
      return {
        key: 'overdue',
        label: 'Overdue',
        severity: 'warning',
      }
    }
  }
  
  // 5. Healthy (last_status === 'success')
  if (backup.last_status === 'success') {
    return {
      key: 'healthy',
      label: 'Healthy',
      severity: 'success',
    }
  }
  
  // 6. Unknown (default)
  return {
    key: 'unknown',
    label: 'Unknown',
    severity: 'default',
  }
}

/**
 * Check if backup is disabled
 */
export function isBackupDisabled(backup: Backup): boolean {
  return backup.is_enabled === false
}

/**
 * Check if backup is running
 */
export function isBackupRunning(backup: Backup): boolean {
  return backup.last_status === 'running'
}

/**
 * Check if backup failed
 */
export function isBackupFailed(backup: Backup): boolean {
  return backup.last_status === 'failed'
}

/**
 * Check if backup is overdue
 */
export function isBackupOverdue(backup: Backup): boolean {
  if (backup.is_enabled === false) return false
  if (!backup.next_due_at) return false
  
  const now = new Date()
  const dueDate = new Date(backup.next_due_at)
  return now > dueDate
}

/**
 * Calculate summary counts from backup list
 */
export function calculateBackupSummary(backups: Backup[]): BackupSummary {
  const summary: BackupSummary = {
    total: backups.length,
    healthy: 0,
    overdue: 0,
    failed: 0,
    disabled: 0,
    running: 0,
  }
  
  backups.forEach((backup) => {
    const health = getBackupHealth(backup)
    // Each backup counts in only one bucket (following precedence)
    switch (health.key) {
      case 'disabled':
        summary.disabled++
        break
      case 'running':
        summary.running++
        break
      case 'failed':
        summary.failed++
        break
      case 'overdue':
        summary.overdue++
        break
      case 'healthy':
        summary.healthy++
        break
      default:
        // unknown - don't count
        break
    }
  })
  
  return summary
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms?: number): string {
  if (!ms || ms === 0) return '0s'
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Format retention info
 */
export function formatRetention(backup: Backup): string {
  if (backup.retention_keep_last_n) {
    return `Keep last ${backup.retention_keep_last_n}`
  }
  if (backup.retention_keep_days) {
    return `${backup.retention_keep_days} ${backup.retention_keep_days === 1 ? 'day' : 'days'}`
  }
  return 'N/A'
}

/**
 * Format storage backend label
 */
export function formatStorageBackend(backend?: string): string {
  if (!backend) return 'N/A'
  
  const labels: Record<string, string> = {
    local_fs: 'Local FS',
    nas: 'NAS',
    s3: 'S3',
    remote: 'Remote',
  }
  
  return labels[backend] || backend
}

/**
 * Format schedule summary
 */
export function formatScheduleSummary(backup: Backup): string {
  if (backup.schedule_type === 'manual_only') {
    return 'Manual only'
  }
  
  if (backup.schedule_type === 'daily' && backup.schedule_spec) {
    return `Daily at ${backup.schedule_spec}`
  }
  
  if (backup.schedule_type === 'weekly' && backup.schedule_spec) {
    return `Weekly: ${backup.schedule_spec}`
  }
  
  if (backup.schedule_type === 'cron' && backup.schedule_spec) {
    return `Cron: ${backup.schedule_spec}`
  }
  
  return backup.schedule_type || 'N/A'
}

/**
 * Check if backup is heavy (CCTV or name contains "cctv")
 */
export function isHeavyBackup(backup: Backup): boolean {
  if (backup.meta) {
    const meta = typeof backup.meta === 'string' 
      ? JSON.parse(backup.meta) 
      : backup.meta
    if (meta?.category === 'cctv') {
      return true
    }
  }
  
  if (backup.name && backup.name.toLowerCase().includes('cctv')) {
    return true
  }
  
  return false
}
