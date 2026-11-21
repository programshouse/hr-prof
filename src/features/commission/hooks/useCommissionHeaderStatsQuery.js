import { useQuery } from '@tanstack/react-query';
import { commissionHeaderApi } from '../api/commissionHeader.api';
import { commissionHeaderKeys } from '../api/commissionHeader.keys';

export function useCommissionHeaderStatsQuery(departmentId, monthString, enabled = true) {
  // dep can be real id OR null (means ALL)
  const dep =
    departmentId !== undefined &&
    departmentId !== null &&
    String(departmentId) !== '' &&
    String(departmentId) !== 'all'
      ? String(departmentId)
      : null;

  return useQuery({
    queryKey: commissionHeaderKeys.stats(dep, monthString),
    queryFn: () => commissionHeaderApi.getCommissionStats({ departmentId: dep, month: monthString }),
    // allow fetching even if dep is null => ALL departments endpoint
    enabled: enabled && !!monthString,
    staleTime: 60_000,
  });
}
