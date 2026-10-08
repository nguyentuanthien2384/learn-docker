export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const MAX_LIMIT = 100;

export function getPagination(query: { page?: number; limit?: number }, defaultLimit = 20): PaginationParams {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function toPaginated<T>(data: T[], total: number, { page, limit }: PaginationParams): Paginated<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
