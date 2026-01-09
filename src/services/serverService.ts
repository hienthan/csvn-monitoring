import pb from '@/lib/pb'
import type { Server, ServerListParams, ServerListResponse } from '@/types/server'

const COLLECTION_NAME = 'ma_servers'

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
}

