import { useQuery } from '@tanstack/react-query';
import { getAdminPermissions } from '../api/permissions.api';

export function useAdminPermissionsQuery(adminId) {
  return useQuery({
    queryKey: ['admin-permissions', adminId],
    enabled: !!adminId,
    queryFn: async () => {
      if (!adminId) return null;
      return await getAdminPermissions(adminId);
    },
  });
}