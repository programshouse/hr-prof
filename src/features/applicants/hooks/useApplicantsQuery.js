import { useQuery } from '@tanstack/react-query';
import { applicantsApi } from '../api/applicants.api';
import { applicantsKeys } from '../api/applicants.keys';

function normalizeParams(input = {}) {
  const params = { ...input };

  if (params.page == null) params.page = 1;
  if (params.limit == null) params.limit = 10;

  Object.keys(params).forEach((k) => {
    if (params[k] === 'all' || params[k] === '' || params[k] == null) delete params[k];
  });

  return params;
}

export function useApplicantsQuery(rawParams) {
  const params = normalizeParams(rawParams);

  return useQuery({
    queryKey: applicantsKeys.table({
      page: params.page,
      limit: params.limit,
      keyword: params.keyword ?? '',
      position_id: params.position_id ?? 'all',
      status: params.status ?? 'all',
    }),
    queryFn: () => applicantsApi.getTable(params),
    keepPreviousData: true,
  });
}