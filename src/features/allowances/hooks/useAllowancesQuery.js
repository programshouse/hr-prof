import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { allowancesApi } from '../api/allowances.api';
import { allowancesKeys } from '../api/allowances.keys';

export function useAllowancesQuery({
  page = 1,
  limit = 10,
  keyword = '',
  department_id = '',
  from_date = '',
  to_date = '',
}) {
  return useQuery({
    queryKey: allowancesKeys.list({
      page,
      limit,
      keyword,
      department_id,
      from_date,
      to_date,
    }),
    queryFn: () =>
      allowancesApi.getAllowances({
        page,
        limit,
        keyword: keyword || undefined,
        department_id: department_id || undefined,
        from_date: from_date || undefined,
        to_date: to_date || undefined,
      }),
    placeholderData: keepPreviousData,
  });
}
