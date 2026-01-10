import pb from '@/lib/pb'
import type { ServerApp, AppListParams, AppListResponse } from '@/types/app'

const COLLECTION_NAME = 'ma_apps'

export const appService = {
  /**
   * Get list of apps with pagination
   */
  async list(params: AppListParams = {}): Promise<AppListResponse> {
    try {
      const {
        page = 1,
        perPage = 50,
        sort = '-created',
        filter = '',
        expand = '',
      } = params

      const result = await pb.collection(COLLECTION_NAME).getList<ServerApp>(
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
      console.error('Error fetching apps:', error)
      throw error
    }
  },

  /**
   * Get a single app by ID
   */
  async getById(id: string, expand?: string): Promise<ServerApp> {
    try {
      const result = await pb.collection(COLLECTION_NAME).getOne<ServerApp>(
        id,
        {
          expand,
        }
      )
      return result
    } catch (error) {
      console.error(`Error fetching app ${id}:`, error)
      throw error
    }
  },

  /**
   * Get apps by server ID
   */
  async getByServerId(
    serverId: string,
    params: Omit<AppListParams, 'filter'> = {}
  ): Promise<AppListResponse> {
    const filter = `server = "${serverId}"`
    return this.list({ ...params, filter })
  },

  /**
   * Get apps by filter
   */
  async getByFilter(
    filter: string,
    params: Omit<AppListParams, 'filter'> = {}
  ): Promise<AppListResponse> {
    return this.list({ ...params, filter })
  },

  /**
   * Create a new app
   */
  async create(data: Partial<ServerApp>): Promise<ServerApp> {
    try {
      const result = await pb.collection(COLLECTION_NAME).create<ServerApp>(data)
      return result
    } catch (error) {
      console.error('Error creating app:', error)
      throw error
    }
  },

  /**
   * Update an app by ID
   */
  async update(id: string, data: Partial<ServerApp>): Promise<ServerApp> {
    try {
      const result = await pb.collection(COLLECTION_NAME).update<ServerApp>(id, data)
      return result
    } catch (error) {
      console.error(`Error updating app ${id}:`, error)
      throw error
    }
  },

  /**
   * Delete an app by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await pb.collection(COLLECTION_NAME).delete(id)
      return true
    } catch (error) {
      console.error(`Error deleting app ${id}:`, error)
      throw error
    }
  },
}

