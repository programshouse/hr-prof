import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '../api/assets.api';
import { assetsKeys } from '../api/assets.api';

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useUpdateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
    },
  });
}
