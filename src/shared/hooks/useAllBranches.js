import { useQuery } from '@tanstack/react-query';
import { branchApi } from '@/features/settings/api/branch.api';
import i18n from '@/i18n';

export function useAllBranches({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['branches', i18n.language],
    queryFn: async () => {
      const res = await branchApi.getBranches();
      return res?.data?.data ?? res?.data ?? res ?? [];
    },
    enabled,
  });
}
