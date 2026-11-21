import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '@/features/settings/api/department.api';
import i18n from '@/i18n';

export function useAllDepartments({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['departments', i18n.language],
    queryFn: async () => {
      const res = await departmentApi.getDepartments();
      return res?.data ?? [];
    },
    enabled,
  });
}
