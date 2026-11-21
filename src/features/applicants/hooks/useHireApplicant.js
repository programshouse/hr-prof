// src/features/applicants/hooks/useHireApplicant.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hireApplicant } from '../api/applicants.hire.api';

export default function useHireApplicant(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicantId, payload }) => {
      return hireApplicant(applicantId, payload);
    },

    onSuccess: async (data, variables, context) => {
      // refresh applicants lists / headers after successful hire
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ['applicants'] }),
        queryClient.invalidateQueries({ queryKey: ['applicants-header'] }),
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
        queryClient.invalidateQueries({ queryKey: ['employees-header'] }),
      ]);

      if (typeof options.onSuccess === 'function') {
        options.onSuccess(data, variables, context);
      }
    },

    onError: (error, variables, context) => {
      if (typeof options.onError === 'function') {
        options.onError(error, variables, context);
      }
    },
  });
}