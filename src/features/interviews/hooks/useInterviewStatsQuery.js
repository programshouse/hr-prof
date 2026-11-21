import { useQuery } from '@tanstack/react-query';
import { interviewStatsApi } from '../api/interviews.stats.api';

export const useInterviewStatsQuery = () => {
  return useQuery({
    queryKey: ['interview-stats'],
    queryFn: interviewStatsApi.getInterviewStats,
    select: (data) => data?.data || {},
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
