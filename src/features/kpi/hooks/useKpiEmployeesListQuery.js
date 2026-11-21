import { useQuery } from '@tanstack/react-query';
import { kpiEmployeesListApi } from '../api/kpiEmployeesList.api';
import { kpiEmployeesListKeys } from '../api/kpiEmployeesList.keys';

export function useKpiEmployeesListQuery(params, enabled = true) {
  return useQuery({
    queryKey: kpiEmployeesListKeys.list(params),
    queryFn: () => kpiEmployeesListApi.getEmployeesList(params),
    enabled,
    keepPreviousData: true,
  });
}
