import { useQuery } from '@tanstack/react-query';
import { structureApi } from '../api/structure.api';
import { structureKeys } from '../api/structure.keys';

export function useStructureQuery() {
  return useQuery({
    queryKey: structureKeys.organization(),
    queryFn: () => structureApi.getOrganizationStructure(),
    select: (response) => response?.data ?? [],
  });
}
