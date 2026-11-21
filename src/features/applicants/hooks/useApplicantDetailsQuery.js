// src/features/applicants/hooks/useApplicantDetailsQuery.js
import { useQuery } from '@tanstack/react-query';
import { applicantsApi } from '../api/applicants.api';
import { applicantsKeys } from '../api/applicants.keys';

export function useApplicantDetailsQuery(id) {
  return useQuery({
    queryKey: applicantsKeys.detail(id),
    queryFn: () => applicantsApi.getOne(id),
    enabled: !!id,
  });
}