import { useMutation, useQueryClient } from '@tanstack/react-query';
import { remotelyApi } from '../api/remotely.api';
import { remotelyKeys } from '../api/remotely.keys';
import { toast } from 'sonner';

export function useUpsertRemotely() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => remotelyApi.createRemotely(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: remotelyKeys.all });
      toast.success('Remote request created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create remote request';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => remotelyApi.updateRemotely(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: remotelyKeys.all });
      queryClient.invalidateQueries({ queryKey: remotelyKeys.detail(variables.id) });

      toast.success('Remote request updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update remote request';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

//  Delete hook
export function useDeleteRemotely() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => remotelyApi.deleteRemotely(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: remotelyKeys.all });
      queryClient.invalidateQueries({ queryKey: remotelyKeys.detail(id) });

      // optional (only if you use summary anywhere)
      queryClient.invalidateQueries({ queryKey: remotelyKeys.summary?.() });

      toast.success('Remote request deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete remote request';
      toast.error(message);
    },
  });
}
