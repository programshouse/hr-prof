// src/features/resignations/hooks/useUpsertResignation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resignationsApi } from '../api/resignations.api';
import { resignationKeys } from '../api/resignations.keys';
import { toast } from 'sonner';

export function useUpsertResignation() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (formData) => resignationsApi.createResignation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resignationKeys.all });
      toast.success('Resignation request created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create resignation request');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => {
      if (values instanceof FormData && !values.has('_method')) {
        values.append('_method', 'PATCH');
      }
      return resignationsApi.updateResignation({ id, values });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: resignationKeys.all });
      queryClient.invalidateQueries({ queryKey: resignationKeys.detail(variables.id) });
      toast.success('Resignation request updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update resignation request');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

//  Delete hook
export function useDeleteResignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => resignationsApi.deleteResignation(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: resignationKeys.all });
      queryClient.invalidateQueries({ queryKey: resignationKeys.detail(id) });

      // optional (only if you use summary anywhere)
      queryClient.invalidateQueries({ queryKey: resignationKeys.summary?.() });

      toast.success('Resignation request deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete resignation request';
      toast.error(message);
    },
  });
}
