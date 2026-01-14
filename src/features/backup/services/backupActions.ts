import { backupService } from './backupService'
import type { Backup } from '../types'

/**
 * Run backup now (trigger backup execution)
 * If VITE_BACKUP_RUN_ENDPOINT exists, call it. Otherwise show stub message.
 */
export async function runBackupNow(backupId: string): Promise<void> {
  const endpoint = import.meta.env.VITE_BACKUP_RUN_ENDPOINT

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId }),
      })

      if (!response.ok) {
        throw new Error(`Backup run failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error calling backup run endpoint:', error)
      throw error
    }
  } else {
    // Stub mode - just log
    console.log('Run triggered (stub). Configure VITE_BACKUP_RUN_ENDPOINT to execute real backups.')
    // Return a promise that resolves after a short delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

/**
 * Update backup status optimistically (for UI feedback)
 * This doesn't persist to PocketBase, just updates local state
 */
export function getOptimisticRunningBackup(backup: Backup): Backup {
  return {
    ...backup,
    last_status: 'running',
    last_run_at: new Date().toISOString(),
  }
}
