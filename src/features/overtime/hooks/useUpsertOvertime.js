import { useMutation, useQueryClient } from '@tanstack/react-query';
import { overtimeApi } from '../api/overtime.api';
import { overtimeKeys } from '../api/overtime.keys';
import { toast } from 'sonner';

export function useUpsertOvertime() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => overtimeApi.createOvertimeRequest(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      toast.success('Overtime request created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create overtime request';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => overtimeApi.updateOvertimeRequest(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      queryClient.invalidateQueries({ queryKey: overtimeKeys.detail(variables.id) });

      toast.success('Overtime request updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update overtime request';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

// Delete hook
export function useDeleteOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => overtimeApi.deleteOvertimeRequest(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all });
      queryClient.invalidateQueries({ queryKey: overtimeKeys.detail(id) });

      // optional (only if you use summary anywhere)
      queryClient.invalidateQueries({ queryKey: overtimeKeys.summary?.() });

      toast.success('Overtime request deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete overtime request';
      toast.error(message);
    },
  });
}
