import { useMutation, useQueryClient } from '@tanstack/react-query';
import { freelancersApi } from '../api/freelancers.api';
import { freelancersKeys } from '../api/freelancers.keys';

export const useAddFreelancerWorkedHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: freelancersApi.addFreelancersWorkedHours,
    onSuccess: () => {
      // Invalidate and refetch freelancers data
      queryClient.invalidateQueries({ queryKey: freelancersKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add freelancer worked hours:', error);
    },
  });
};
