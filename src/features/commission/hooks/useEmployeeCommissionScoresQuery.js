import { useQuery } from '@tanstack/react-query';
import { employeeCommissionApi } from '../api/employeeCommission.api';
import { employeeCommissionKeys } from '../api/employeeCommission.keys';

export function useEmployeeCommissionScoresQuery(employeeId, monthString, enabled = true) {
  return useQuery({
    queryKey: employeeCommissionKeys.scores(employeeId, monthString),
    queryFn: () => employeeCommissionApi.getEmployeeCommissionScores({ employeeId, month: monthString }),
    enabled: enabled && !!employeeId && !!monthString,
    staleTime: 60_000,
  });
}
