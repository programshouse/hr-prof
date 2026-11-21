import { useQuery } from '@tanstack/react-query';
import { getAdmins } from '../api/permissions.api';

export function useAdminsQuery() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const admins = await getAdmins();

      return admins.map((admin) => ({
        ...admin,
        permissionsCount: Array.isArray(admin.permissions) ? admin.permissions.length : 0,
      }));
    },
  });
}