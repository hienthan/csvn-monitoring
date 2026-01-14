import pb from '@/lib/pb'
import type { Backup, BackupListParams, BackupListResponse } from '../types'
import { normalizePbError } from '@/features/tickets/utils'

const COLLECTION_NAME = 'ma_backups'

/**
 * Parse meta field (can be JSON string or object)
 */
function parseMeta(meta: unknown): Record<string, unknown> | null {
  if (!meta) return null
  if (typeof meta === 'object' && meta !== null) return meta as Record<string, unknown>
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Normalize backup record (parse meta, ensure types)
 */
function normalizeBackup(record: Backup): Backup {
  return {
    ...record,
    meta: parseMeta(record.meta),
  }
}

export const backupService = {
  /**
   * Get list of backups with pagination
   */
  async list(params: BackupListParams = {}): Promise<BackupListResponse> {
    try {
      const {
        page = 1,
        perPage = 50,
        sort = '-created',
        filter = '',
        expand = '',
      } = params

      const result = await pb.collection(COLLECTION_NAME).getList<Backup>(
        page,
        perPage,
        {
          sort,
          filter,
          expand: expand || 'app_id,server_id',
        }
      )

      return {
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        items: result.items.map(normalizeBackup),
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
      const normalized = normalizePbError(error)
      throw new Error(normalized.message)
    }
  },

  /**
   * Get a single backup by ID
   */
  async getById(id: string, expand?: string): Promise<Backup> {
    try {
      const result = await pb.collection(COLLECTION_NAME).getOne<Backup>(
        id,
        {
          expand: expand || 'app_id,server_id',
        }
      )
      return normalizeBackup(result)
    } catch (error) {
      console.error(`Error fetching backup ${id}:`, error)
      const normalized = normalizePbError(error)
      throw new Error(normalized.message)
    }
  },

  /**
   * Create a new backup record
   */
  async create(payload: Partial<Backup>): Promise<Backup> {
    try {
      // Convert meta object to JSON string if needed
      const createPayload = { ...payload }
      if (createPayload.meta && typeof createPayload.meta === 'object') {
        createPayload.meta = JSON.stringify(createPayload.meta) as any
      }

      const result = await pb.collection(COLLECTION_NAME).create<Backup>(
        createPayload as any
      )
      return normalizeBackup(result)
    } catch (error) {
      console.error('Error creating backup:', error)
      const normalized = normalizePbError(error)
      throw new Error(normalized.message)
    }
  },

  /**
   * Update a backup record
   */
  async update(id: string, payload: Partial<Backup>): Promise<Backup> {
    try {
      // Convert meta object to JSON string if needed
      const updatePayload = { ...payload }
      if (updatePayload.meta && typeof updatePayload.meta === 'object') {
        updatePayload.meta = JSON.stringify(updatePayload.meta) as any
      }

      const result = await pb.collection(COLLECTION_NAME).update<Backup>(
        id,
        updatePayload as any
      )
      return normalizeBackup(result)
    } catch (error) {
      console.error(`Error updating backup ${id}:`, error)
      const normalized = normalizePbError(error)
      throw new Error(normalized.message)
    }
  },

  /**
   * Delete a backup record
   */
  async delete(id: string): Promise<void> {
    try {
      await pb.collection(COLLECTION_NAME).delete(id)
    } catch (error) {
      console.error(`Error deleting backup ${id}:`, error)
      const normalized = normalizePbError(error)
      throw new Error(normalized.message)
    }
  },
}
