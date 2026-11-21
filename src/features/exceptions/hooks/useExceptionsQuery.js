import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { exceptionsApi } from '../api/exceptions.api';
import { exceptionsKeys } from '../api/exceptions.keys';

export const useExceptionsQuery = (
  currentPage = 1,
  pageSize = 10,
  company = 'all',
  search = '',
  branch = 'all',
  shift = 'all',
  selectedMonth = null,
  position = 'all'
) => {
  const monthISO = selectedMonth ? selectedMonth.toISOString() : undefined;

  return useQuery({
    queryKey: exceptionsKeys.list({
      page: currentPage,
      pageSize,
      company,
      search,
      branch,
      shift,
      month: monthISO,
      position,
    }),

    queryFn: () =>
      exceptionsApi.getExceptions({
        page: currentPage,
        pageSize,
        company,
        search,
        branch,
        shift,
        month: monthISO,
        position,
      }),

    placeholderData: keepPreviousData,
    staleTime: 0,
  });
};