// src/features/internships/hooks/useUpsertInternship.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { internshipsApi } from '../api/internships.api';
import { toast } from 'sonner';

export function useUpsertInternship() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => internshipsApi.createInternship(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      toast.success('Internship created successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || 'Failed to create internship';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => internshipsApi.updateInternship({ id, values }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      toast.success('Internship updated successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || 'Failed to update internship';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
