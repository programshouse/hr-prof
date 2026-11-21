import { useQuery } from '@tanstack/react-query';
import { meetingsApi } from '../api/meetings.api';
import { meetingsKeys } from '../api/meetings.keys';

export function useMeetingsQuery(params = {}) {
  return useQuery({
    queryKey: meetingsKeys.list(params),
    queryFn: () => meetingsApi.getAll(params),
  });
}
