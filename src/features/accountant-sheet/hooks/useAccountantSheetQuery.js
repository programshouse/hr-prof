import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { accountantSheetApi } from '../api/accountantSheet.api';
import { accountantSheetKeys } from '../api/accountantSheet.keys';

export function useAccountantSheetQuery({
  year,
  month,
  page = 1,
  limit = 10,
  keyword = '',
  salary_payment_day = '',
  department_id = '',
  salary_method = '',
}) {
  console.log('HOOK CALLED', {
    year,
    month,
    page,
    limit,
    keyword,
    salary_payment_day,
    department_id,
    salary_method,
  });

  return useQuery({
    queryKey: accountantSheetKeys.list({
      year,
      month,
      page,
      limit,
      keyword,
      salary_payment_day,
      department_id,
      salary_method,
    }),
    queryFn: async () => {
      console.log('QUERY FN RUNNING');

      return accountantSheetApi.getAccountantSheet({
        year,
        month,
        page,
        limit,
        keyword: keyword || undefined,
        salary_payment_day: salary_payment_day || undefined,
        department_id: department_id || undefined,
        salary_method: salary_method || undefined,
      });
    },
    placeholderData: keepPreviousData,
    enabled: true,
  });
}