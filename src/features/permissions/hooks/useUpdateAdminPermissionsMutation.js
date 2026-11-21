import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminPermissions } from '../api/permissions.api';
import { toast } from 'sonner';

export function useUpdateAdminPermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminPermissions,

    onSuccess: (response, variables) => {
      toast.success(response?.message || 'Permissions updated successfully');

      // invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['admin-permissions', variables.adminId],
      });

      queryClient.invalidateQueries({
        queryKey: ['admins'],
      });
    },

    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong';

      toast.error(message);
    },
  });
}
