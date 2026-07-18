export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const getPaginationParams = (
  searchParams: URLSearchParams,
  defaults: PaginationParams = { page: 1, limit: 20 },
): PaginationParams => {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? String(defaults.page)) || defaults.page);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? String(defaults.limit)) || defaults.limit));
  return { page, limit };
};

export const paginate = <T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
};

export const prismaPagination = (params: PaginationParams) => ({
  skip: (params.page - 1) * params.limit,
  take: params.limit,
});
