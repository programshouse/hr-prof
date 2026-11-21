import { useQuery } from '@tanstack/react-query';
import { fetchAllNotifications } from '../api/fetchAllNotifications';
import { notificationKeys } from '../api/notifications.keys';
import { countUnreadNotifications } from '../utils/notificationUtils';

const DEFAULT_PARAMS = {
  page: 1,
  per_page: 20,
  audience: 'system',
};

export function useNotificationsQuery(params = DEFAULT_PARAMS, options = {}) {
  const queryParams = { ...DEFAULT_PARAMS, ...params };

  return useQuery({
    queryKey: notificationKeys.list(queryParams),
    queryFn: async () => {
      const { rows, meta } = await fetchAllNotifications(queryParams);

      return {
        rows,
        meta,
        unreadCount: countUnreadNotifications(rows),
      };
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    ...options,
  });
}
