import { useMutation, useQueryClient } from '@tanstack/react-query';
import { penaltiesApi } from '../api/penalties.api';
import { penaltyKeys } from '../api/penalties.keys';
import { toast } from 'sonner';

export function useUpsertPenalty() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => penaltiesApi.createPenalty(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: penaltyKeys.all });
      toast.success('Penalty created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create penalty';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => penaltiesApi.updatePenalty(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: penaltyKeys.all });
      queryClient.invalidateQueries({
        queryKey: penaltyKeys.detail(variables.id),
      });

      toast.success('Penalty updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update penalty';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

export function useDeletePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: penaltiesApi.deletePenalty,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: penaltyKeys.all });
      toast.success('Penalty deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete penalty';
      toast.error(message);
    },
  });
}
