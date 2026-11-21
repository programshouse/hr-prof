import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi } from '../api/interviews.api';
import { toast } from 'sonner';

export const useInterviewsMutations = () => {
  const queryClient = useQueryClient();

  // Helpers
  const handleSuccess = (res, fallback) => {
    toast.success(res?.message || fallback || 'Success');
  };

  const handleError = (error, fallback) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      fallback ||
      'Something went wrong';

    toast.error(message);
    console.error('Interview mutation error:', error);
  };

  const createInterviewMutation = useMutation({
    mutationFn: interviewsApi.createInterview,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      handleSuccess(res, 'Interview created successfully');
    },
    onError: (error) => {
      handleError(error, 'Failed to create interview');
    },
  });

  const updateInterviewMutation = useMutation({
    mutationFn: interviewsApi.updateInterview,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      handleSuccess(res, 'Interview updated successfully');
    },
    onError: (error) => {
      handleError(error, 'Failed to update interview');
    },
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: interviewsApi.deleteInterview,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      handleSuccess(res, 'Interview deleted successfully');
    },
    onError: (error) => {
      handleError(error, 'Failed to delete interview');
    },
  });

  return {
    createInterview: createInterviewMutation.mutateAsync,
    updateInterview: updateInterviewMutation.mutateAsync,
    deleteInterview: deleteInterviewMutation.mutateAsync,
    isCreating: createInterviewMutation.isPending,
    isUpdating: updateInterviewMutation.isPending,
    isDeleting: deleteInterviewMutation.isPending,
  };
};