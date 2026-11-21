import { useQuery } from '@tanstack/react-query';
import { meetingsApi } from '../api/meetings.api';
import { meetingsKeys } from '../api/meetings.keys';

export function useMeetingQuery(id) {
  return useQuery({
    queryKey: meetingsKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await meetingsApi.getMeeting(id);
      return res?.data?.data ?? res?.data ?? res;
    },
    enabled: !!id,
  });
}
