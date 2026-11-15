export interface ApiResponse<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T, M extends PaginationMeta = PaginationMeta> {
  data: T[];
  meta: M;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
