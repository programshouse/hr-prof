// src/features/employees/hooks/useCountriesQuery.js
import { useQuery } from '@tanstack/react-query';
import { getCountries } from '../api/countries';

export function useCountriesQuery() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: Infinity,
    select: (data) => data?.data || data || [], // Handle both data.data and direct data formats
  });
}
