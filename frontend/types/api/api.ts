export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc' | '' | null
}

export interface BaseParams<T = PaginationParams> {
  filter?: T
}

export interface PaginationMeta {
  current_page: number
  total_page: number
  total_element: number
  size: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}