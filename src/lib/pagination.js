export function getPaginationParams(pageIndex, pageSize) {
  return {
    page: pageIndex + 1,
    limit: pageSize,
  };
}

export function parsePaginationResponse(response) {
  return {
    data: response.data || [],
    pageCount: response.meta?.totalPages || 0,
    rowCount: response.meta?.total || 0,
  };
}

export function getPaginationRowModel(table) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const rows = table.getFilteredRowModel().rows;
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return rows.slice(start, end);
}
