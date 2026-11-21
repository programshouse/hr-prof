import { useQuery } from '@tanstack/react-query';
import { kpiHeaderApi } from '../api/kpiHeader.api';
import { kpiHeaderKeys } from '../api/kpiHeader.keys';

export function useKpiHeaderStatsQuery(departmentId, year, month, enabled = true) {
  // dep can be real id OR null (means ALL)
  const dep =
    departmentId !== undefined &&
    departmentId !== null &&
    String(departmentId) !== '' &&
    String(departmentId) !== 'all'
      ? String(departmentId)
      : null;

  return useQuery({
    queryKey: kpiHeaderKeys.stats(dep, year, month),
    queryFn: () => kpiHeaderApi.getKpiStats({ departmentId: dep, year, month }),
    // allow fetching even if dep is null => ALL departments endpoint
    enabled: enabled && !!year && !!month,
    staleTime: 60_000,
  });
}
