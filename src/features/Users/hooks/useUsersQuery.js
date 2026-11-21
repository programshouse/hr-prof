import { useQuery } from '@tanstack/react-query';
import { usersApi, usersKeys } from '../api/users.api';

export function useUsersQuery(params = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
    select: (response) => ({
      data: Array.isArray(response?.data) ? response.data : [],
      meta: response?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: params.per_page ?? 10,
        total: 0,
      },
    }),
    keepPreviousData: true,
  });
}