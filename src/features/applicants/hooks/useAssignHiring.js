// src/features/applicants/hooks/useAssignHiring.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicantsApi } from '../api/applicants.api';
import { applicantsKeys } from '../api/applicants.keys';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useAssignHiring(options = {}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ applicantId, payload }) => {
      return applicantsApi.assignHiring(applicantId, payload);
    },

    onSuccess: async (data, variables, context) => {
      toast.success(
        data?.message || t('applicants.assignHiringSuccess', 'Hiring responsibles assigned successfully.')
      );

      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: applicantsKeys.all }),
        queryClient.invalidateQueries({ queryKey: applicantsKeys.detail(variables.applicantId) }),
        queryClient.invalidateQueries({ queryKey: ['applicants-header'] }),
      ]);

      if (typeof options.onSuccess === 'function') {
        options.onSuccess(data, variables, context);
      }
    },

    onError: (error, variables, context) => {
      const msg =
        error?.response?.data?.message ||
        t('applicants.assignHiringError', 'Failed to assign hiring responsibles');
      toast.error(msg);

      if (typeof options.onError === 'function') {
        options.onError(error, variables, context);
      }
    },
  });
}

export default useAssignHiring;
