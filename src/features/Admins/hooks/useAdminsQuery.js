import { useQuery } from '@tanstack/react-query';
import { adminsApi, adminsKeys } from '../api/admins.api';

export function useAdminsQuery() {
  return useQuery({
    queryKey: adminsKeys.lists(),
    queryFn: adminsApi.getAdmins,
    select: (response) => response?.data ?? [],
  });
}