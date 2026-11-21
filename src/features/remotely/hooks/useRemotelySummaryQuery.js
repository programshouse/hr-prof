// src/features/remotely/hooks/useRemotelySummaryQuery.js
import { useQuery } from '@tanstack/react-query';
import { remotelyApi } from '../api/remotely.api';
import { remotelyKeys } from '../api/remotely.keys';

export function useRemotelySummaryQuery() {
  return useQuery({
    queryKey: [...remotelyKeys.all, 'summary'],
    queryFn: async () => {
      const response = await remotelyApi.getRemotelySummary();

      // Expected Response (from user prompt):
      // {
      //   "total_remote_requests": 2,
      //   "approved_remotely": 0,
      //   "rejected_remotely": 0,
      //   "pending_remotely": 2
      // }

      const data = response?.data || response || {};

      return {
        totalRemotely: data.total_remote_requests || 0,
        approvedRemotely: data.approved_remotely || 0,
        rejectedRemotely: data.rejected_remotely || 0,
        pendingRemotely: data.pending_remotely || 0,
      };
    },
  });
}
