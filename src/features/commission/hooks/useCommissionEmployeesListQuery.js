import { useQuery } from '@tanstack/react-query';
import { commissionEmployeesListApi } from '../api/commissionEmployeesList.api';
import { commissionEmployeesListKeys } from '../api/commissionEmployeesList.keys';

export function useCommissionEmployeesListQuery(params, enabled = true) {
  return useQuery({
    queryKey: commissionEmployeesListKeys.list(params),
    queryFn: () => commissionEmployeesListApi.getEmployeesList(params),
    enabled,
    keepPreviousData: true,
  });
}
