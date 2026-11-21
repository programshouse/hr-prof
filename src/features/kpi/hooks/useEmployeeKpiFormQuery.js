import { useQuery } from '@tanstack/react-query';
import { employeeKpiApi } from '../api/employeeKpi.api';
import { employeeKpiKeys } from '../api/employeeKpi.keys';

export function useEmployeeKpiFormQuery(employeeId, year, month, enabled = true) {
  return useQuery({
    queryKey: employeeKpiKeys.form(employeeId, year, month),
    queryFn: () => employeeKpiApi.getEmployeeKpiForm({ employeeId, year, month }),
    enabled: enabled && !!employeeId && !!year && !!month,
  });
}
