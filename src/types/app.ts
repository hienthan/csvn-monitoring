export interface ServerApp {
  id: string
  server?: string
  name?: string
  path?: string
  status?: string
  description?: string
  created?: string
  updated?: string
  expand?: {
    [key: string]: any
  }
  [key: string]: unknown
}

export interface AppListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface AppListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: ServerApp[]
}

