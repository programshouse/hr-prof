import { useQuery } from '@tanstack/react-query';
import { getPermissions } from '../api/permissions.api';

export function usePermissionsQuery() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      return await getPermissions();
    },
  });
}