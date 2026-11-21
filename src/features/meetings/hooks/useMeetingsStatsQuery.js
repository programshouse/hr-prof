import { useQuery } from '@tanstack/react-query';
import { meetingsApi } from '../api/meetings.api';
import { meetingsKeys } from '../api/meetings.keys';

export function useMeetingsStatsQuery(params = {}) {
  return useQuery({
    queryKey: meetingsKeys.statsWithFilters(params),
    queryFn: () => meetingsApi.getStats(params),
  });
}
