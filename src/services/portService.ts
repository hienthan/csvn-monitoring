import pb from '@/lib/pb'
import type {
  ServerPort,
  PortListParams,
  PortListResponse,
} from '@/types/port'

const COLLECTION_NAME = 'ma_server_ports'

export const portService = {
  /**
   * Get list of ports with pagination
   */
  async list(params: PortListParams = {}): Promise<PortListResponse> {
    try {
      const {
        page = 1,
        perPage = 50,
        sort = '-created',
        filter = '',
        expand = '',
      } = params

      const result = await pb.collection(COLLECTION_NAME).getList<ServerPort>(
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
      console.error('Error fetching ports:', error)
      throw error
    }
  },

  /**
   * Get a single port by ID
   */
  async getById(id: string, expand?: string): Promise<ServerPort> {
    try {
      const result = await pb.collection(COLLECTION_NAME).getOne<ServerPort>(
        id,
        {
          expand,
        }
      )
      return result
    } catch (error) {
      console.error(`Error fetching port ${id}:`, error)
      throw error
    }
  },

  /**
   * Get ports by server ID
   */
  async getByServerId(
    serverId: string,
    params: Omit<PortListParams, 'filter'> = {}
  ): Promise<PortListResponse> {
    const filter = `server = "${serverId}"`
    return this.list({ ...params, filter })
  },

  /**
   * Get ports by filter
   */
  async getByFilter(
    filter: string,
    params: Omit<PortListParams, 'filter'> = {}
  ): Promise<PortListResponse> {
    return this.list({ ...params, filter })
  },
}

