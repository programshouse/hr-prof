import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsApi } from '../api/rewards.api';
import { rewardKeys } from '../api/rewards.keys';
import { toast } from 'sonner';

export function useUpsertReward() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values) => rewardsApi.createReward(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      toast.success('Reward created successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to create reward';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params) => rewardsApi.updateReward(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({
        queryKey: rewardKeys.detail(variables.id),
      });

      toast.success('Reward updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update reward';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardsApi.deleteReward,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      toast.success('Reward deleted successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete reward';
      toast.error(message);
    },
  });
}