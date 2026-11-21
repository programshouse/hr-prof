import { useQuery } from '@tanstack/react-query';
import { getGovernoratesByCountry } from '../api/countries';

export function useGovernoratesQuery(countryId) {
  return useQuery({
    queryKey: ['governorates', countryId],
    queryFn: () => getGovernoratesByCountry(countryId),
    enabled: !!countryId,
    staleTime: Infinity,
    select: (data) => data?.data || data || [], // Handle both data.data and direct data formats
  });
}
