import { useMutation, useQueryClient } from '@tanstack/react-query';
import { branchTransfersApi } from '../api/branch-transfers.api';
import { branchTransfersKeys } from '../api/branch-transfers.keys';
import { toast } from 'sonner';

export function useUpsertBranchTransfer() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => branchTransfersApi.createBranchTransfer(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchTransfersKeys.all });
      toast.success('Branch transfer request created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create branch transfer request';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => branchTransfersApi.updateBranchTransfer(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: branchTransfersKeys.all });
      queryClient.invalidateQueries({ queryKey: branchTransfersKeys.detail(variables.id) });

      toast.success('Branch transfer request updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update branch transfer request';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

//  Delete hook
export function useDeleteBranchTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => branchTransfersApi.deleteBranchTransfer(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: branchTransfersKeys.all });
      queryClient.invalidateQueries({ queryKey: branchTransfersKeys.detail(id) });

      // optional (only if you use summary anywhere)
      queryClient.invalidateQueries({ queryKey: branchTransfersKeys.summary?.() });

      toast.success('Branch transfer request deleted successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || 'Failed to delete branch transfer request';
      toast.error(message);
    },
  });
}
