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

