import { useQuery } from '@tanstack/react-query';
import { interviewsApi } from '../api/interviews.api';

export const useInterviewsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['interviews', params],
    queryFn: () => interviewsApi.getInterviews(params),
    select: (data) => data,
    keepPreviousData: true,
  });
};
