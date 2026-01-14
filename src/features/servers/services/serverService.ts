import pb from '@/lib/pb'
import type { Server, ServerListParams, ServerListResponse } from '../types'

const COLLECTION_NAME = 'ma_servers'

/**
 * Map frontend Server data to PocketBase payload
 * - docker_mode (UI)      → docker_mode (select: 'none' | 'cli' | 'desktop')
 * - environment (UI)      → env (select: 'prd' | 'dev', default 'prd')
 */
function mapServerPayload(data: Partial<Server>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...data }

  // Map environment (UI) → env (DB)
  // UI uses short codes in state ('prd' | 'dev'), but we also accept legacy strings.
  const envSource = data.environment
  if (envSource) {
    const envLower = String(envSource).toLowerCase()
    if (envLower === 'prd' || envLower === 'production') {
      payload.env = 'prd'
    } else if (envLower === 'dev' || envLower === 'development') {
      payload.env = 'dev'
    } else {
      // Fallback to prd if unexpected
      payload.env = 'prd'
    }
  } else {
    // Default required env
    payload.env = 'prd'
  }

  // Map docker_mode → docker_mode select
  // DB expects: 'none' | 'cli' | 'desktop'
  const dockerSource = data.docker_mode
  const allowedModes = ['none', 'cli', 'desktop']

  if (dockerSource !== undefined && dockerSource !== null) {
    const modes: string[] = []

    if (Array.isArray(dockerSource)) {
      dockerSource.forEach((m) => {
        const modeLower = String(m).toLowerCase()
        if (allowedModes.includes(modeLower)) {
          modes.push(modeLower)
        }
      })
    } else if (typeof dockerSource === 'boolean') {
      // Backwards compatibility: true → 'cli', false → no mode (empty → none in UI)
      if (dockerSource) modes.push('cli')
    } else {
      const modeLower = String(dockerSource).toLowerCase()
      if (allowedModes.includes(modeLower)) {
        modes.push(modeLower)
      }
    }

    // For multi-select field in PB, pass array of selected modes
    if (modes.length > 0) {
      payload.docker_mode = modes
    } else {
      payload.docker_mode = []
    }
  } else {
    // Default: no docker modes selected
    payload.docker_mode = []
  }

  return payload
}

export const serverService = {
  /**
   * Get list of servers with pagination
   */
  async list(params: ServerListParams = {}): Promise<ServerListResponse> {
    try {
      const {
        page = 1,
        perPage = 50,
        sort = '-created',
        filter = '',
        expand = '',
      } = params

      const result = await pb.collection(COLLECTION_NAME).getList<Server>(
        page,
        perPage,
        {
          sort,
          filter,
          expand,
        }
      )

      return {
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        items: result.items,
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
      throw error
    }
  },

  /**
   * Get a single server by ID
   */
  async getById(id: string, expand?: string): Promise<Server> {
    try {
      const result = await pb.collection(COLLECTION_NAME).getOne<Server>(id, {
        expand,
      })
      return result
    } catch (error) {
      console.error(`Error fetching server ${id}:`, error)
      throw error
    }
  },

  /**
   * Get servers by filter
   */
  async getByFilter(
    filter: string,
    params: Omit<ServerListParams, 'filter'> = {}
  ): Promise<ServerListResponse> {
    return this.list({ ...params, filter })
  },

  /**
   * Create a new server
   */
  async create(data: Partial<Server>): Promise<Server> {
    try {
      const payload = mapServerPayload(data)
      const result = await pb.collection(COLLECTION_NAME).create<Server>(payload)
      return result
    } catch (error) {
      console.error('Error creating server:', error)
      throw error
    }
  },

  /**
   * Update a server by ID
   */
  async update(id: string, data: Partial<Server>): Promise<Server> {
    try {
      const payload = mapServerPayload(data)
      const result = await pb.collection(COLLECTION_NAME).update<Server>(id, payload)
      return result
    } catch (error) {
      console.error(`Error updating server ${id}:`, error)
      throw error
    }
  },

  /**
   * Delete a server by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await pb.collection(COLLECTION_NAME).delete(id)
      return true
    } catch (error) {
      console.error(`Error deleting server ${id}:`, error)
      throw error
    }
  },
}
