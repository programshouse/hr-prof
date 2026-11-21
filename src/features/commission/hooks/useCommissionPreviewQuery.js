import { useQuery } from '@tanstack/react-query';
import { commissionApi } from '../api/commission.api';
import { commissionKeys } from '../api/commission.keys';

export function useCommissionPreviewQuery(employeeId, month, baseAmount, enabled = true) {
  return useQuery({
    queryKey: commissionKeys.preview(employeeId, month, baseAmount),
    queryFn: () => commissionApi.previewCommission({ employeeId, month, baseAmount }),
    enabled: enabled && !!employeeId && !!month && !!baseAmount && baseAmount > 0,
    staleTime: 30_000,
  });
}
