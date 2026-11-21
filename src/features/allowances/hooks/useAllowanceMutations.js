import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryClient } from '@/lib/react-query';
import { allowancesApi } from '../api/allowances.api';
import { allowancesKeys } from '../api/allowances.keys';

export function useAllowanceMutations() {
  const createMutation = useMutation({
    mutationFn: allowancesApi.createAllowance,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: allowancesKeys.all });
      toast.success(res?.message || 'Allowance created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create allowance');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => allowancesApi.updateAllowance(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: allowancesKeys.all });
      toast.success(res?.message || 'Allowance updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update allowance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: allowancesApi.deleteAllowance,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: allowancesKeys.all });
      toast.success(res?.message || 'Allowance deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete allowance');
    },
  });

  return {
    createAllowance: createMutation,
    updateAllowance: updateMutation,
    deleteAllowance: deleteMutation,
  };
}
