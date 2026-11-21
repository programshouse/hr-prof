import { useQuery } from '@tanstack/react-query';
import { resignationsApi } from '../api/resignations.api';
import { resignationKeys } from '../api/resignations.keys';

export function useResignationSummaryQuery() {
  return useQuery({
    queryKey: resignationKeys.summary(),
    queryFn: async () => {
      const response = await resignationsApi.getResignationSummary();

      const data = response?.data || response || {};

      return {
        totalResignations: data.total_resignations || 0,
        approvedResignations: data.approved_resignations || 0,
        rejectedResignations: data.rejected_resignations || 0,
        pendingResignations: data.pending_resignations || 0,
      };
    },
  });
}
