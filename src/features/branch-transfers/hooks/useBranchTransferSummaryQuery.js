import { useQuery } from '@tanstack/react-query';
import { branchTransfersApi } from '../api/branch-transfers.api';
import { branchTransfersKeys } from '../api/branch-transfers.keys';

export function useBranchTransferSummaryQuery() {
  return useQuery({
    queryKey: branchTransfersKeys.summary(),
    queryFn: async () => {
      const response = await branchTransfersApi.getBranchTransferSummary();

      // Response: { totalbranch-transfers_requests, approved_branch-transfers, rejected_branch-transfers, pending_branch-transfers }
      const data = response?.data || response || {};

      return {
        totalRequests:
          data.totalbranch_transfers_requests || data['totalbranch-transfers_requests'] || 0,
        approvedTransfers: data.approved_branch_transfers || data['approved_branch-transfers'] || 0,
        rejectedTransfers: data.rejected_branch_transfers || data['rejected_branch-transfers'] || 0,
        pendingTransfers: data.pending_branch_transfers || data['pending_branch-transfers'] || 0,
      };
    },
  });
}
