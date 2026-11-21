import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../api/leaves.api';
import { leaveKeys } from '../api/leaves.keys';
import { toast } from 'sonner';

export function useUpsertLeave() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => leavesApi.createLeave(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toast.success('Leave created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create leave';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => leavesApi.updateLeave(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({
        queryKey: leaveKeys.detail(variables.id),
      });

      toast.success('Leave updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update leave';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

//  NEW: Delete hook (used by DeleteLeaveModal)
export function useDeleteLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => leavesApi.deleteLeave(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(id) });

      toast.success('Leave deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete leave';
      toast.error(message);
    },
  });
}
