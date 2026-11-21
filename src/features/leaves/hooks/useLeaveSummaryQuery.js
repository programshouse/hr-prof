// src/features/leaves/hooks/useLeaveSummaryQuery.js
import { useQuery } from '@tanstack/react-query';
import { leavesApi } from '../api/leaves.api';
import { leaveKeys } from '../api/leaves.keys';

export function useLeaveSummaryQuery() {
  return useQuery({
    queryKey: [...leaveKeys.all, 'summary'],
    queryFn: async () => {
      const response = await leavesApi.getLeaveSummary();

      // Response: { total_leaves, approved_leaves, rejected_leaves, pending_leaves }
      // This response structure is direct, or wrapped in data? The user example:
      // { "total_leaves": 4, "approved_leaves": 0, ... }
      // Assuming it might come as { status: true, data: { ... } } or directly.
      // Based on Penalties it was response?.data.
      // If the API returns the JSON directly as the body:
      const data = response || {};

      return {
        totalLeaves: data.total_leaves || 0,
        approvedLeaves: data.approved_leaves || 0,
        rejectedLeaves: data.rejected_leaves || 0,
        pendingLeaves: data.pending_leaves || 0,
      };
    },
  });
}
