import { useQuery } from '@tanstack/react-query';
import { applicantsApi } from '../api/applicants.api';

export const useApplicantsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['applicants'],
    queryFn: async () => {
      const result = await applicantsApi.getApplicants();
      console.log('Applicants API response:', result);
      return result;
    },
    enabled,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      const applicants = data?.data || [];
      console.log('Normalized applicants:', applicants);
      return applicants;
    },
  });
};
