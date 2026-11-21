// src/features/applicants/hooks/useDeleteApplicant.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicantsApi } from '../api/applicants.api';
import { applicantsKeys } from '../api/applicants.keys';
import { toast } from 'sonner';

export const useDeleteApplicant = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => applicantsApi.remove(id),

    onSuccess: () => {
      toast.success('Applicant deleted successfully');

      qc.invalidateQueries({ queryKey: applicantsKeys.list() });
      qc.invalidateQueries({ queryKey: applicantsKeys.header() });
      qc.invalidateQueries({
        queryKey: applicantsKeys.table?.() || ['applicants', 'table'],
      });
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete applicant'
      );
    },
  });
};