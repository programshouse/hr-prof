import { useQuery } from '@tanstack/react-query';
import { overtimeApi } from '../api/overtime.api';
import { overtimeKeys } from '../api/overtime.keys';

export function useOvertimeSummaryQuery() {
  return useQuery({
    queryKey: overtimeKeys.summary(),
    queryFn: async () => {
      const response = await overtimeApi.getOvertimeSummary();

      // Response: { total_overtime_requests, approved_overtime, rejected_overtime, pending_overtime }
      const data = response?.data || response || {};

      return {
        totalRequests: data.total_overtime_requests || 0,
        approvedOvertime: data.approved_overtime || 0,
        rejectedOvertime: data.rejected_overtime || 0,
        pendingOvertime: data.pending_overtime || 0,
      };
    },
  });
}
