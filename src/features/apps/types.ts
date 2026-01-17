export interface ServerApp {
  id: string
  collectionId?: string
  collectionName?: string
  server?: string
  name?: string
  path?: string
  status?: string
  description?: string
  repo_url?: string
  tech_stack?: string
  // created_by: business owner / author of the app (UI label: Owner)
  created_by?: string
  key?: string
  department?: string
  port?: string | number
  environment?: string
  docker_mode?: boolean | string
  backup_enabled?: boolean
  backup_frequency?: string
  notes?: string
  is_deleted?: boolean
  created?: string
  updated?: string
  expand?: {
    server?: {
      id: string
      name?: string
      ip?: string
      host?: string
    }
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
