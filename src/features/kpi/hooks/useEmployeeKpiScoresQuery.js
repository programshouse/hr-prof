import { useQuery } from '@tanstack/react-query';
import { employeeKpiApi } from '../api/employeeKpi.api';
import { employeeKpiKeys } from '../api/employeeKpi.keys';

export function useEmployeeKpiScoresQuery(employeeId, year, month, enabled = true) {
  return useQuery({
    queryKey: employeeKpiKeys.scores(employeeId, year, month),
    queryFn: () => employeeKpiApi.getEmployeeKpiScores({ employeeId, year, month }),
    enabled: !!employeeId && !!year && !!month && enabled,
  });
}
