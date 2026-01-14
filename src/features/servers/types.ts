export interface Server {
  id: string
  name: string
  host?: string
  ip?: string
  docker_mode?: string | boolean
  environment?: string
  os?: string
  status?: string
  location?: string
  is_netdata_enabled?: boolean
  notes?: string
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

// Port types (ports belong to servers)
export interface ServerPort {
  id: string
  server?: string
  port?: number
  protocol?: string
  status?: string
  description?: string
  service_name?: string
  container_name?: string
  internal_port?: number
  external_port?: number
  app?: string | ServerAppRelation
  created?: string
  updated?: string
  [key: string]: unknown
}

export interface ServerAppRelation {
  id: string
  name?: string
  path?: string
  [key: string]: unknown
}

export interface PortListParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
  expand?: string
}

export interface PortListResponse {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: ServerPort[]
}
