import { useQuery } from '@tanstack/react-query';
import { employeeCommissionApi } from '../api/employeeCommission.api';
import { employeeCommissionKeys } from '../api/employeeCommission.keys';

export function useEmployeeCommissionFormQuery(employeeId, monthString, enabled = true) {
  return useQuery({
    queryKey: employeeCommissionKeys.form(employeeId, monthString),
    queryFn: () => employeeCommissionApi.getEmployeeCommissionForm({ employeeId, month: monthString }),
    enabled: enabled && !!employeeId && !!monthString,
    staleTime: 60_000,
  });
}
