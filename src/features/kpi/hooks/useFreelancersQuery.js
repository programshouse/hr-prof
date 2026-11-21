import { useQuery } from '@tanstack/react-query';
import { freelancersApi } from '../api/freelancers.api';
import { freelancersKeys } from '../api/freelancers.keys';

export const useFreelancersQuery = (params, enabled = true) => {
  return useQuery({
    queryKey: freelancersKeys.listWithParams(params),
    queryFn: () => freelancersApi.getFreelancersReport(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
