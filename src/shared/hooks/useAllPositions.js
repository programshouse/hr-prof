import { useQuery } from '@tanstack/react-query';
import { positionApi } from '@/features/settings/api/position.api';
import i18n from '@/i18n';

export function useAllPositions({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['positions', i18n.language],
    queryFn: async () => {
      const res = await positionApi.getPositions();
      const positions = res?.data?.data ?? res?.data ?? res ?? [];
      return positions;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled,
  });
}
