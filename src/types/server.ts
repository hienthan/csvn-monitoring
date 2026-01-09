export interface Server {
  id: string
  name: string
  host?: string
  ip?: string
  docker_mode?: string | boolean
  environment?: string
  os?: string
  status?: string
  created?: string
  updated?: string
  [key: string]: unknown
}

export interface ServerListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface ServerListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: Server[]
}

