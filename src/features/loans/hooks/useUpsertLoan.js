import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '../api/loans.api';
import { loansKeys } from '../api/loans.keys';
import { toast } from 'sonner';

export function useUpsertLoan() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => loansApi.createLoan(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loansKeys.all });
      toast.success('Loan request created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create loan request';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => loansApi.updateLoan(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: loansKeys.all });
      queryClient.invalidateQueries({ queryKey: loansKeys.detail(variables.id) });

      toast.success('Loan request updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update loan request';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

//Delete hook
export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => loansApi.deleteLoan(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: loansKeys.all });
      queryClient.invalidateQueries({ queryKey: loansKeys.detail(id) });

      // optional (only if you use summary anywhere)
      queryClient.invalidateQueries({ queryKey: loansKeys.summary?.() });

      toast.success('Loan request deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete loan request';
      toast.error(message);
    },
  });
}
