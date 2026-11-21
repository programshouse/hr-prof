import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminsApi, adminsKeys } from '../api/admins.api';

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminsApi.createAdmin,
    onSuccess: (response) => {
      toast.success(response?.message || 'Admin created successfully');
      queryClient.invalidateQueries({ queryKey: adminsKeys.all });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create admin';
      toast.error(message);
    },
  });
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => adminsApi.updateAdmin(id, data),
    onSuccess: (response) => {
      toast.success(response?.message || 'Admin updated successfully');
      queryClient.invalidateQueries({ queryKey: adminsKeys.all });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update admin';
      toast.error(message);
    },
  });
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminsApi.deleteAdmin,
    onSuccess: (response) => {
      toast.success(response?.message || 'Admin deleted successfully');
      queryClient.invalidateQueries({ queryKey: adminsKeys.all });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete admin';
      toast.error(message);
    },
  });
}