import { useQuery } from '@tanstack/react-query';
import { applicantsPublicLookupsApi } from '../api/applicants.public.lookups.api';

/* ===============================
   Public Positions
================================= */
export function usePublicPositions(companyId = '1') {
  const resolvedCompanyId = companyId || '1';
  return useQuery({
    queryKey: [
      'public',
      'positions',
      resolvedCompanyId,
    ],

    queryFn: () =>
      applicantsPublicLookupsApi.getPositions(resolvedCompanyId),

    staleTime: 5 * 60 * 1000,

    enabled: Boolean(resolvedCompanyId),

  });

}


/* ===============================
   Public Countries
================================= */
export function usePublicCountries() {
  return useQuery({
    queryKey: ['public', 'countries'],
    queryFn: applicantsPublicLookupsApi.getCountries,
    staleTime: 60 * 60 * 1000,
  });
}

/* ===============================
   Public Governorates
================================= */
export function usePublicGovernorates(countryId) {
  return useQuery({
    queryKey: ['public', 'governorates', String(countryId || '')],
    queryFn: () =>
      applicantsPublicLookupsApi.getGovernoratesByCountry(countryId),
    enabled: Boolean(countryId),
    staleTime: 60 * 60 * 1000,
  });
}